module.exports = function (server) {
  return function nameTag ({ name, tag }, cb) {
    if (!name || !tag) return cb(new Error('nameTag expects a name and tag'))
    server.publish({ type: 'about', about: tag, name }, cb)
  }
}
