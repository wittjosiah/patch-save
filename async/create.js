const isTag = require('../sync/isTag')
const TagError = require('../sync/TagError')

module.exports = function (server) {
  return function createTag (recps, cb) {
    const msg = recps && recps.length > 0 ? {
      type: 'tag',
      recps,
      private: true
    } : { type: 'tag' }

    if (!isTag(msg)) return cb(TagError(msg))
    server.publish(msg, cb)
  }
}
