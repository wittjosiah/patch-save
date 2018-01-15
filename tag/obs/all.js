var nest = require('depnest')
var { Dict, Array } = require('mutant')
var MutantPullReduce = require('mutant-pull-reduce')

exports.needs = nest({
  'sbot.pull.stream': 'first'
})

exports.gives = nest('tags.obs.all', true)

exports.create = function (api) {
  var cached = null
  return nest('tags.obs.all', () => {
    if (!cached) {
      var stream = api.sbot.pull.stream(s => s.tags.stream({live: true}))
      cached = MutantPullReduce(stream, (result, data) => {
        if (data.tags) {
          // handle initial state
          for (var tag in data.tags) {
            var messages = new Dict()
            for (var message in data.tags[tag]) {
              if (data.tags[tag][message].tagged) {
                messages.put(message, data.tags[tag][message])
              }
            }
            result.put(tag, messages)
          }
        } else if (data.tag) {
          // handle realtime changes
          var { author, tag, message, tagged, timestamp } = data
          if (!result.get(tag)) result.put(tag, new Dict())
          if (tagged && (!result.get(tag).get(message) || timestamp > result.get(tag).get(message).timestamp)) {
            result.get(tag).put(message, { timestamp, tagged })
          } else if (!tagged && result.get(tag).get(message)) {
            result.get(tag).delete(message)
          }
        }
        return result
      }, {
        startValue: new Dict()
      })
    }
    return cached
  })
}
