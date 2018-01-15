const nest = require('depnest')
const defer = require('pull-defer')
const pull = require('pull-stream')
const onceTrue = require('mutant/once-true')

exports.gives = nest('tag.pull.find')

exports.needs = nest({
  'sbot.obs.connection': 'first'
})

exports.create = function(api) {
  return nest({ 'tag.pull.find': find })

  function find(opts) {
    return StreamWhenConnected(api.sbot.obs.connection, (sbot) => {
      if (!sbot.tags || !sbot.tags.stream) return pull.empty()
      return sbot.tags.stream(opts)
    })
  }
}

// COPIED from patchcore 'feed.pull.private'
function StreamWhenConnected (connection, fn) {
  var stream = defer.source()
  onceTrue(connection, function (connection) {
    stream.resolve(fn(connection))
  })
  return stream
}
