module.exports = function (msg) {
  return new Error(`Not a valid tag ${JSON.stringify(msg, null, 2)}`)
}
