const { msgIdRegex } = require('ssb-ref')

module.exports = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  required: ['type'],
  properties: {
    type: { type: 'string', pattern: 'tag' },
    tagged: { type: 'boolean' },
    message: { type: 'string', pattern: msgIdRegex },
    root: { type: 'string', pattern: msgIdRegex },
    branch: { type: 'string', pattern: msgIdRegex }
  }
}