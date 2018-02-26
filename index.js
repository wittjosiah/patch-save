var modules = {
  tag: {
    async: {
      apply: require('./tag/async/apply'),
      create: require('./tag/async/create'),
      name: require('./tag/async/name'),
    },
    obs: require('./tag/obs'),
  }
}


module.exports = { 'patch-tag': modules }

