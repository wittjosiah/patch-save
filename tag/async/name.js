const nest = require('depnest')

exports.gives = nest('tag.async.name')

exports.needs = nest({
  'sbot.async.publish': 'first'
})

exports.create = function (api) {
  return nest('tag.async.name', function ({ name, tag }, cb) {
    api.sbot.async.publish({ type: 'about', about: tag, name }, cb)
  })
}
