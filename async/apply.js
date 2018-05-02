const isTag = require('../sync/isTag')

module.exports = function(server, api) {
  return function(data, cb) {
    const { tagged, message, recps, tag } = data
    const msg = recps && recps.length > 0 ? {
      type: 'tag',
      tagged,
      message,
      root: tag,
      branch: tag,
      recps: data.recps,
      private: true
    } : {
      type: 'tag',
      tagged,
      message,
      root: tag,
      branch: tag
    }
    if (!isTag(msg)) return cb(new Error(`Not a valid tag ${JSON.stringify(msg, null, 2)}`))
    server.publish(msg, cb)
  }
}
