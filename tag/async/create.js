const nest = require('depnest')

exports.gives = nest('tag.async.create')

exports.needs = nest({
  'sbot.async.publish': 'first'
})

exports.create = function(api) {
  return nest('tag.async.create', function(recps, cb) {
    if (recps && recps.length === 0) {
      api.sbot.async.publish({
        type: 'tag',
        recps: data.recps,
        private: true
      }, cb)
    } else {
      api.sbot.async.publish({ type: 'tag' }, cb)
    }
  })
}
