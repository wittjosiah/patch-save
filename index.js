const methods = {
  async: {
    apply: require('./async/apply'),
    create: require('./async/create'),
    name: require('./async/name'),
  },
  html: {
    edit: require('./html/edit'),
    tag: require('./html/tag'),
  },
  obs: {
    obs: require('./obs/obs'),
    tag: require('./obs/tag'),
  }
}

module.exports = function ScuttleTag(server, api) {
  return require('./lib/inject')(server, api, methods)
}
