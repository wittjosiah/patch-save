const nest = require('depnest')
const { Struct } = require('mutant')

exports.gives = nest('tag.obs.tag')

exports.needs = nest({
  'about.obs.name': 'first',
})

exports.create = function(api) {
  return nest({ 'tag.obs.tag': function(tagId) {
    return Struct({
      tagId: Value(tagId),
      tagName: api.about.obs.name(tagId),
    })
  }})
}