const nest = require('depnest')
const { Value, Set, Struct, forEachPair } = require('mutant')

exports.needs = nest({
  'save.async.save': 'first'
})

exports.gives = nest('save.obs.struct')

exports.create = function(api) {
  return nest('save.obs.struct', function(opts = {}) {
    const struct = Struct({
      notes: Value(''),
      tags: Set([]),
      recps: Set([])
    })

    Object.keys(opts).forEach(k => {
      if (!opts[k]) return

      if (typeof opts[k] === 'function') struct[k] = opts[k]
      else struct[k].set(opts[k])
    })

    struct.save = id => {
      api.save.async.save({
        recps: struct.recps(),
        messageId: id,
        notes: struct.notes(),
        tags: struct.tags()
      }, console.log)
    }

    return struct
  })
}
