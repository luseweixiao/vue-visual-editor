const htmlTemplate = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Document</title><style>*{ padding:0;margin:0;}#container{overflow:hidden;width:100%;height:0;position:absolute;padding-top:#{containerPaddingTop}#}</style></head>
<body><div id="container">#{containerInnerHtml}#</div></body></html>`;

/**
 * 根据nodeObj生成dom结构
 * @param {ComponentDomNode} obj
 * @returns {HTMLDivElement}
 */
export function createDom (obj) {
  let dom = null
  try {
    let { style = {} } = obj
    const { tag = 'div', styleFragment: domStyleFragment, attrs = {}, children, text } = obj
    dom = document.createElement(tag)
    if (domStyleFragment && domStyleFragment.length > 0) {
      const _style = {}
      domStyleFragment.forEach(item => {
        Object.assign(_style, styleFragment[item] || null)
      })
      style = Object.assign({}, _style, style)
    }
    Object.keys(style).forEach(key => {
      dom.style[key] = style[key]
    })
    Object.keys(styleFragment._defaultStyle).forEach(key => {
      dom.style[key] = styleFragment._defaultStyle[key]
    })
    Object.keys(attrs).forEach(key => {
      dom.setAttribute(key, attrs[key])
    })
    if (text) {
      dom.innerText = text
    }
    if (children && children.length > 0) {
      children.forEach(item => {
        dom.appendChild(createDom(item))
      })
    }
  } catch (e) {
    console.error(e)
  }
  return dom
}

export function exportH5 () {
  const allWidgets = getAllWidgets()
  const background = store.state.poster.background
  const backgroundHtml = background._codeGen(background)
  const canvasSize = store.state.poster.canvasSize
  let bodyInnerHtml = ''
  allWidgets.forEach(item => {
    if (!item.visible) {
      return
    }
    if (item._codeGen) {
      bodyInnerHtml += item._codeGen(item, 'h5') || ''
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn(`类型为${item.type}的组件的构造函数未实现"_codeGen"方法`)
    }
  })
  const finalHtmlCode = htmlTemplate
    .replace(
      '#{containerPaddingTop}#',
      `${canvasSize.height * 100 / canvasSize.width}%`
    )
    .replace(
      '#{containerInnerHtml}#',
      backgroundHtml + bodyInnerHtml
    )
  const htmlBolb = new Blob([finalHtmlCode], { type: 'text/html' })
  saveAs(htmlBolb, 'index.html')
}