export function getStyle (style, filter = []) {
  const needUnit = [
    'fontSize',
    'width',
    'height',
    'top',
    'left',
    'borderWidth',
    'letterSpacing',
    'borderRadius',
    "lineHeight",
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomRightRadius",
    "borderBottomLeftRadius",
  ]

  const result = {}
  Object.keys(style).forEach(key => {
    if (filter.includes(key)) {
      if (key != 'rotate') {
        result[key] = style[key];

        if (needUnit.includes(key)) {
          result[key] += 'px';
        }
      } else {
        result.transform = key + '(' + style[key] + 'deg)';
      }
    }
  })

  // console.log("result", result)
  return result;
}

export function getComponentStyle (item) {
  return getStyle(item.style, [
    'top',
    'left',
    'width',
    'height',
    'fontSize',
    "color",
    "backgroundColor",
    "borderWidth",
    "borderColor",
    "lineHeight",
    "textAlign",
    "fontWeight",
    "alignItems",
    "textDecoration",
    "fontStyle",
    "borderStyle",
    // "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomRightRadius",
    "borderBottomLeftRadius",
  ]);
}
