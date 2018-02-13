const nest = require('depnest')

exports.gives = nest('tag.async.apply')

exports.needs = nest({
  'sbot.async.publish': 'first'
})

exports.create = function(api) {
  return nest('tag.async.apply', function(data, cb) {
    const { tagged, message, recps, tag } = data
    if (recps && recps.length > 0) {
      api.sbot.async.publish({
        type: 'tag',
        tagged,
        message,
        root: tag,
        branch: tag,
        recps: data.recps,
        private: true
      }, cb)
    } else {
      api.sbot.async.publish({
        type: 'tag',
        tagged,
        message,
        root: tag,
        branch: tag
      }, cb)
    }
  })
}
