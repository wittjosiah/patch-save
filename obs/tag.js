const { Struct } = require('mutant')

// Not quite sure this is useful with the patchcore stipped out.
// Could be we roll our own with ssb-about

module.exports = function (server) {
  return function Tag (tagId, nameFn) {
    return Struct({
      tagId,
      tagName: nameFn(tagId)
    })
  }
}
