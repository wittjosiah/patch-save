const { map } = require('libnested')
const { onceTrue, watch, Value } = require('mutant')
const get = require('lodash/get')

// auto-inject the ssb-server to all methods to reduce repitition
module.exports = function inject(server, methods) {
  switch (typeof server) {
    case 'object': // just a classic ssb server
      checkPlugins(server)
      return map(methods, (fn, path) => fn(server, api))

    case 'function': // hopefully an observeable which will contain an ssb server
      return injectObsServer(server, api, methods)

    default:
      throw new Error('scuttle-tag expects an ssb server (or obs that contains one)')
  }
}

function injectObsServer(server, api, methods) {
  onceTrue(server, checkPlugins)

  return map(methods, (fn, path) => {
    if (path[0] === 'async') {
      return function() {
        onceTrue(
          server,
          server => fn(server, api).apply(null, arguments)
        )
      }
    }

    // NOTE - both `obs` and `sync` methods will return observeables
    return function() {
      var result = Value({})
      onceTrue(
        server,
        server => {
          var res = fn(server, api).apply(null, arguments)
          watch(res, res => result.set(res))
        }
      )
      return result
    }
  })
}

const PLUGIN_DEPS = ['tags', 'about']

function checkPlugins(server) {
  PLUGIN_DEPS.forEach(p => {
    if (!server[p]) throw new Error(`scuttle-tag needs a scuttlebot server with the ${p} plugin installed`)
  })
}

const MODULE_DEPS = [
  ['keys', 'sync', 'id'],
  ['about', 'obs', 'name'],
  ['about', 'obs', 'color']
]

function checkModules(api) {
  MODULE_DEPS.forEach(m => {
    if (!get(api, m)) throw new Error(`scuttle-tag needs the api method ${m.join('.')}`)
  })
}