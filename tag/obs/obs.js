var { Value, Set, computed } = require('mutant')
var pull = require('pull-stream')
var nest = require('depnest')
var ref = require('ssb-ref')
var set = require('lodash/set')
var unset = require('lodash/unset')
var get = require('lodash/get')
var isEmpty = require('lodash/isEmpty')

exports.needs = nest({
  'sbot.pull.stream': 'first'
})

exports.gives = nest({
  'tag.obs': [
    'taggedMessages',
    'messageTags',
    'messageTagsFrom',
    'messageTaggers',
    'allTagsFrom',
    'allTags'
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
      messageTagsFrom,
      messageTaggers,
      allTagsFrom,
      allTags
    }
  })

  function taggedMessages(author, tagId) {
    if (!ref.isFeed(author) || !ref.isLink(tagId)) throw new Error('Requires an ssb ref!')
    return withSync(computed([getObs(author, tagsCache), tagId], getTaggedMessages))
  }

  function messageTags(msgId) {
    if (!ref.isLink(msgId)) throw new Error('Requires an ssb ref!')
    return withSync(computed(getObs(msgId, messagesCache), getMessageTags))
  }

  function messageTagsFrom(msgId, author) {
    if (!ref.isLink(msgId) || !ref.isFeed(author)) throw new Error('Requires an ssb ref!')
    return withSync(computed([getObs(msgId, messagesCache), author], getMessageTagsFrom))
  }

  function messageTaggers(msgId, tagId) {
    if (!ref.isLink(msgId) || !ref.isLink(tagId)) throw new Error('Requires an ssb ref!')
    return withSync(computed([getObs(msgId, messagesCache), tagId], getMessageTaggers))
  }

  function allTagsFrom(author) {
    if (!ref.isFeed(author)) throw new Error('Requires an ssb ref!')
    return withSync(computed(getObs(author, tagsCache), Object.keys))
  }

  function allTags() {
    return withSync(getAllTags(getCache(tagsCache)))
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

  function getCache(lookup) {
    if (!cacheLoading) {
      cacheLoading = true
      loadCache()
    }
    return lookup
  }

  function update(id, values, lookup) {
    const state = getObs(id, lookup)
    const lastState = state()
    var changed = false
  
    for (const tag in values) {
      const lastTag = lastState[tag]
      const isUnusedTag = isEmpty(values[tag]) && (lastTag === undefined || !isEmpty(lastTag))
      if (isUnusedTag) {
        set(lastState, [ tag ], {})
        changed = true
        continue
      }
      for (const key in values[tag]) {
        const value = get(values, [ tag, key ])
        const lastValue = get(lastState, [ tag, key ])
        if (value !== lastValue) {
          if (value) {
            set(lastState, [ tag, key ], value)
          } else {
            unset(lastState, [ tag, key ])
          }
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
        } else if (item && ref.isLink(item.tagKey) && ref.isFeed(item.author) && ref.isLink(item.message)) {
          // handle realtime updates
          const { tagKey, author, message, tagged, timestamp } = item
          if (tagged) {
            update(author, { [tagKey]: { [message]: timestamp } }, tagsCache)
            update(message, { [tagKey]: { [author]: timestamp } }, messagesCache)
          } else {
            update(author, { [tagKey]: { [message]: false } }, tagsCache)
            update(message, { [tagKey]: { [author]: false } }, messagesCache)
          }
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

function getMessageTags(lookup) {
  const tags = []
  for (const tag in lookup) {
    if (!isEmpty(lookup[tag])) {
      tags.push(tag)
    }
  }
  return tags
}

function getMessageTagsFrom(lookup, author) {
  const tags = []
  for (const tag in lookup) {
    if (lookup[tag][author]) {
      tags.push(tag)
    }
  }
  return tags
}

function getMessageTaggers(lookup, key) {
  const taggers = []
  for (const author in lookup[key]) {
    if (lookup[key][author]) {
      taggers.push(author)
    }
  }
  return taggers
}

function getAllTags(lookup) {
  const tags = Set([])
  for (const author in lookup) {
    const authorTags = lookup[author]()
    for (const tag in authorTags) {
      tags.add(tag)
    }
  }
  return tags
}
