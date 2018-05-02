const { h, computed } = require('mutant')
const hexrgb = require('hex-rgb')

module.exports = function(server, api) {
  return function({ tagName, tagId }, handleRemove) {
    var removeTag
    if (handleRemove) {
      removeTag = h('a', {
        'ev-click': handleRemove
      }, 'x')
    } else {
      removeTag = '';
    }

    const backgroundColor = api.about.obs.color(tagId)
    const fontColor = computed(backgroundColor, contrast)

    const style = {
      'background-color': backgroundColor,
      'color': fontColor
    }
    return h('Tag', { style }, [
      h('span', tagName),
      removeTag
    ])
  }})
}

function contrast(backgroundColor) {
  const { red, green, blue } = hexrgb(backgroundColor)
  const C = [ red/255, green/255, blue/255 ]
  for ( var i = 0; i < C.length; ++i ) {
    if ( C[i] <= 0.03928 ) {
      C[i] = C[i] / 12.92
    } else {
      C[i] = Math.pow( ( C[i] + 0.055 ) / 1.055, 2.4);
    }
  }
  const L = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2]
  if (L > 0.179) {
    return '#000'
  } else {
    return '#fff'
  }
}
