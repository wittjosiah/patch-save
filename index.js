const methods = {
  async: {
    apply: require('./async/apply'),
    create: require('./async/create'),
    name: require('./async/name')
  },
  obs: require('./obs')
}

module.exports = function ScuttleTag (server) {
  return require('./lib/inject')(server, methods)
}
