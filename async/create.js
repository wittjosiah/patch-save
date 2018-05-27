const isTag = require('../sync/isTag')

module.exports = function (server) {
  return function createTag (recps, cb) {
    const msg = recps && recps.length > 0 ? {
      type: 'tag',
      recps,
      private: true
    } : { type: 'tag' }
    if (!isTag(msg)) return cb(new Error(`Not a valid tag ${JSON.stringify(msg, null, 2)}`))
    server.publish(msg, cb)
  }
}
