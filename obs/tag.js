const { Struct } = require('mutant')

module.exports = function(server, api) {
  return function(tagId) {
    return Struct({
      tagId: Value(tagId),
      tagName: api.about.obs.name(tagId),
    })
  }
}