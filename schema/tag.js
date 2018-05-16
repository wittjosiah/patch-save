const { msgIdRegex } = require('ssb-ref')

// This is the thing which absolutely needs testing.
module.exports = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  required: ['type'],
  properties: {
    type: { type: 'string', pattern: 'tag' },
    tagged: { type: 'boolean' },
    message: { type: 'string', pattern: msgIdRegex },
    root: { type: 'string', pattern: msgIdRegex },
    // branch: { type: 'string', pattern: msgIdRegex }
    // Branch can be an Array too. I recommend Copy stuff from ssb-poll-schema
  }
}
