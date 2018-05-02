const validator = require('is-my-json-valid')
const schema = require('../schema/tag')
const getMsgContent = require('../lib/getMsgContent')

const isTagContent = validator(schema, {verbose: true})

module.exports = function(server, api) {
  return function isTag(obj) {
    const result = isTagContent(getMsgContent(obj))

    // exposes error messages provided by is-my-json-valid
    isTag.errors = isTagContent.errors

    return result
  }
}
