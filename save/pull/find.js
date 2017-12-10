const nest = require('depnest')
const defer = require('pull-defer')
const pull = require('pull-stream')
const onceTrue = require('mutant/once-true')

exports.gives = nest('save.pull.find')

exports.needs = nest({
  'sbot.obs.connection': 'first'
})

exports.create = function(api) {
  return nest({ 'save.pull.find': find })

  function find(opts) {
    return StreamWhenConnected(api.sbot.obs.connection, (sbot) => {
      if (!sbot.about || !sbot.about.tagsStream) return pull.empty()
      return sbot.about.tagsStream(opts)
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
