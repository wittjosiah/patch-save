var modules = {
  tag: {
    async: {
      apply: require('./tag/async/apply'),
      create: require('./tag/async/create'),
      name: require('./tag/async/name'),
    },
    html: {
      edit: require('./tag/html/edit'),
      tag: require('./tag/html/tag'),
    },
    obs: {
      obs: require('./tag/obs/obs'),
      tag: require('./tag/obs/tag'),
    }
  }
}


module.exports = { 'patch-tag': modules }

