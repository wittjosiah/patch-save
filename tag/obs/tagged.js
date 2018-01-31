var { Value, computed } = require('mutant')
var pull = require('pull-stream')
var nest = require('depnest')
var ref = require('ssb-ref')
var set = require('lodash/set')
var get = require('lodash/get')

exports.needs = nest({
  'sbot.pull.stream': 'first'
})

exports.gives = nest({
  'tag.obs': [
    'taggedMessages',
    'messageTags',
    'allTagsFrom'
  ]
})

exports.create = function(api) {
  var tagsCache = {}
  var messagesCache = {}
  var cacheLoading = false
  var sync = Value(false)

  return nest({
    'tag.obs': {
      taggedMessages,
      messageTags,
      allTagsFrom
    }
  })

  function taggedMessages(author, tagId) {
    if (!ref.isFeed(author) || !ref.isLink(tagId)) throw new Error('Requires an ssb ref!')
    return withSync(computed([getObs(author, tagsCache), tagId], getTaggedMessages))
  }

  function messageTags(msgId, tagId) {
    if (!ref.isLink(tagId) || !ref.isLink(msgId)) throw new Error('Requires an ssb ref!')
    return withSync(computed([getObs(msgId, messagesCache), tagId], getMessageTags))
  }

  function allTagsFrom(author) {
    if (!ref.isFeed(author)) throw new Error('Requires an ssb ref!')
    return withSync(computed(getObs(author, tagsCache), Object.keys))
  }

  function withSync(obs) {
    obs.sync = sync
    return obs
  }

  function getObs(id, lookup) {
    if (!ref.isLink(id)) throw new Error('Requires an ssb ref!')
    if (!cacheLoading) {
      cacheLoading = true
      loadCache()
    }
    if (!lookup[id]) {
      lookup[id] = Value({})
    }
    return lookup[id]
  }

  function update(id, values, lookup) {
    const state = getObs(id, lookup)
    const lastState = state()
    var changed = false
  
    for (const tag in values) {
      for (const key in values[tag]) {
        var value = get(values, [ tag, key ])
        var lastValue = get(lastState, [ tag, key ])
        if (value !== lastValue) {
          set(lastState, [tag, key], value)
          changed = true
        }
      }
    }
  
    if (changed) {
      state.set(lastState)
    }
  }

  function loadCache() {
    pull(
      api.sbot.pull.stream(sbot => sbot.tags.stream({ live: true })),
      pull.drain(item => {
        if (!sync()) {
          // populate tags observable cache
          const messageLookup = {}
          for (const author in item) {
            update(author, item[author], tagsCache)

            // generate message lookup
            for (const tag in item[author]) {
              for (const message in item[author][tag]) {
                set(messageLookup, [message, tag, author], item[author][tag][message])
              }
            }
          }

          // populate messages observable cache
          for (const message in messageLookup) {
            update(message, messageLookup[message], messagesCache)
          }

          if (!sync()) {
            sync.set(true)
          }
        } else if (item && ref.isLink(item.tag) && ref.isFeed(item.author) && ref.isLink(item.message)) {
          // handle realtime updates
          const { tag, author, message, tagged, timestamp } = item
          update(author, { [tag]: { [message]: timestamp } }, tagsCache)
          update(message, { [tag]: { [author]: timestamp } }, messagesCache)
        }
      })
    )
  }
}

function getTaggedMessages(lookup, key) {
  const messages = []
  for (const msg in lookup[key]) {
    if (lookup[key][msg]) {
      messages.push(msg)
    }
  }
  return messages
}

function getMessageTags(lookup, tagId) {
  const tags = {}
  for (const author in lookup[tagId]) {
    if (lookup[tagId][author]) {
      if (!tags[tagId]) tags[tagId] = {}
      tags[tagId][author] = lookup[tagId][author]
    }
  }
  return tags
}
