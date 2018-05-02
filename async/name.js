module.exports = function (server, api) {
  return function ({ name, tag }, cb) {
    server.publish({ type: 'about', about: tag, name }, cb)
  })
}
