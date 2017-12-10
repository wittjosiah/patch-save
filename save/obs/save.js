const nest = require('depnest')
const pull = require('pull-stream')
const ref = require('ssb-ref')
const { computed } = require('mutant')

exports.needs = nest({
  'about.obs.latestValue': 'first',
  'about.obs.valueFrom': 'first',
  'save.obs.struct': 'first'
})

exports.gives = nest('save.obs.save')

exports.create = function(api) {
  return nest('save.obs.save', function(messageId, id) {
    if (!ref.isLink(messageId)) throw new Error('an id must be specified')

    const { latestValue, valueFrom } = api.about.obs

    const save = api.save.obs.struct({
      notes: latestValue(messageId, 'notes'),
      tags: valueFrom(messageId, 'tags', id),
      recps: latestValue(messageId, 'recps')
    })

    return save
  })
}
