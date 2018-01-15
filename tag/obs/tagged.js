var { Value, computed } = require('mutant')
var pull = require('pull-stream')
var nest = require('depnest')
var ref = require('ssb-ref')

exports.needs = nest({
  'sbot.pull.stream': 'first'
})

exports.gives = nest({
  'tag.obs': [
    'taggedMessages',
    'messagesTagged'
  ]
})

exports.create = function(api) {
  var tagsCache = null
  var messagesCache = null
  var sync = Value(false)

  return nest({
    'tag.obs': {
      taggedMessages,
      messageTags
    }
  })

  function taggedMessages(author, tagId) {
    if (!ref.isLink(author) || !ref.isLink(tagId)) throw new Error('Requires an ssb ref!')
    return withSync(computed([get(author, tagsCache), tagId], getTaggedMessages))
  }

  function messageTags(msgId, tagId) {
    if (!ref.isLink(tagId) || !ref.isLink(msgId)) throw new Error('Requires an ssb ref!')
    return withSync(computed([get(msgId, messagesCache), tagId], getMessageTags))
  }

  function withSync(obs) {
    obs.sync = sync
    return obs
  }

  function get(id, lookup) {
    if (!ref.isLink(id)) throw new Error('Requires an ssb ref!')
    load()
    if (!lookup[id]) {
      lookup[id] = Value({})
    }
    return lookup[id]
  }

  function load() {
    if (!tagsCache) {
      tagsCache = {}
      messagesCache = {}
      pull(
        api.sbot.pull.stream(sbot => sbot.tags.stream({ live: true })),
        pull.drain(item => {
          if (!sync()) {
            // populate observable cache
            for (const author in item.tags) {
              update(author, item.tags[author], tagsCache)
            }
            for (const message in item.messages) {
              update(message, item.messages[message], messagesCache)
            }
            if (!sync()) {
              sync.set(true)
            }
          } else if (item && ref.isLink(item.tag) && ref.isLink(item.author) && ref.isLink(item.message)) {
            // handle realtime updates
            const { tag, author, message, tagged, timestamp } = item
            update(author, { [tag]: { [message]: { timestamp, tagged } } }, tagsCache)
            update(message, { [tag]: { [author]: { timestamp, tagged } } }, messagesCache)
          }
        })
      )
    }
  }
}

function update(id, values, lookup) {
  const state = get(id, lookup)
  const lastState = state()
  var changed = false

  for (const tag in values) {
    for (const key in values[tag]) {
      if (values[tag][key] !== lastState[tag][key]) {
        lastState[tag][key] = values[tag][key]
        changed = true
      }
    }
  }

  if (changed) {
    state.set(lastState)
  }
}

function getTaggedMessages(lookup, key) {
  const messages = []
  for (const msg in lookup[key]) {
    if (lookup[key][msg].tagged) {
      messages.push(msg)
    }
  }
  return messages
}

function getMessageTags(lookup, tagId) {
  const tags = {}
  for (const author in lookup[tagId]) {
    if (lookup[tagId][author].tagged) {
      if (!tags[tagId]) tags[tagId] = {}
      tags[tagId][author] = lookup[tagId][author].timestamp
    }
  }
  return tags
}
