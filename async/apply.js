const pull = require('pull-stream')
const { heads } = require('ssb-sort')
const { isFeed } = require('ssb-ref') // TODO check this is name of method!
const isTag = require('../sync/isTag')

module.exports = function (server) {
  return function applyTag (data, cb) {
    const { tagged, message, recps = [], tag } = data
    const _recps = recps.filter(feed => {
      return isFeed(feed) || isFeed(feed.link) // TODO check this logic
    })

    pull(
      createBacklinkStream(tag),
      pull.collect((err, msgs) => {
        if (err) return cb(err)

        var msg = {
          type: 'tag',
          tagged,
          message,
          root: tag,
          branch: heads(msgs)
        }
        if (_recps.length > 0) {
          msg.recps = _recps
          msg.private = true
        }

        if (!isTag(msg)) return cb(TagError(msg))
        server.publish(msg, cb)
      })
    )
  }

  function TagError (msg) {
    return new Error(`Not a valid tag ${JSON.stringify(msg, null, 2)}`)
  }

  function createBacklinkStream (key) {
    var filterQuery = {
      $filter: {
        dest: key
      }
    }

    return server.backlinks.read({
      query: [filterQuery],
      index: 'DTA' // use asserted timestamps
    })
  }
}
