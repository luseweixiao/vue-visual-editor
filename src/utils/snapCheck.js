// const temArr = new Array(3).fill({ display: false, position: '', origin: '', lineLength: '' })
// const refLine = { vLine: [], hLine: [] }
// for (let i in refLine) { refLine[i] = JSON.parse(JSON.stringify(temArr)) }
// let tem = {
//   value: { x: [[], [], []], y: [[], [], []] },
//   display: [],
//   position: []
// }
//维持一个markX,markY的数组{position,isShow},positon就是各个组件的边线、中线位置，isShow通过遍历，满足snap区间的
//添加、删除组件时，更新
//组件拖动时，修改

async function snapCheck({activeLeft,activeRight,activeTop,activeBottom},nodes,activeNode) {
  that=activeNode;
  let width = that.width
  let height = that.height
  if (that.snap) {
    let activeLeft, activeRight, activeTop, activeBottom
    if (that.handle) {
      activeLeft = arguments[0].activeLeft;
      activeRight = arguments[0].activeRight;
      activeTop = arguments[0].activeTop;
      activeBottom = arguments[0].activeBottom;
      width = arguments[0].width;
      height = arguments[0].height;
    } else {
      activeLeft = that.left
      activeRight = that.left + width
      activeTop = that.top
      activeBottom = that.top + height
    }


    // 初始化辅助线数据
    const temArr = new Array(3).fill({ display: false, position: '', origin: '', lineLength: '' })
    const refLine = { vLine: [], hLine: [] }
    for (let i in refLine) { refLine[i] = JSON.parse(JSON.stringify(temArr)) }

    // 获取当前父节点下所有子节点
    let nodes = this.$el.parentNode.childNodes
    nodes = Array.prototype.slice.call(nodes);
    nodes.push(this.$el.parentNode)

    let tem = {
      value: { x: [[], [], []], y: [[], [], []] },
      display: [],
      position: []
    }
    //这里主要是考虑多个活动元素的情况，整体移动时计算其整体区域
    const { groupWidth, groupHeight, groupLeft, groupTop, bln } = await that.getActiveAll(nodes)
    if (!bln) {
      width = groupWidth
      height = groupHeight
      activeLeft = groupLeft
      activeRight = groupLeft + groupWidth
      activeTop = groupTop
      activeBottom = groupTop + groupHeight
    }

    for (let item of nodes) {

      if (item.className !== undefined && !item.className.includes(that.classNameActive) &&
        item.getAttribute('data-is-snap') !== null && item.getAttribute('data-is-snap') !== 'false' || item.id == "editor") {

        const w = item.offsetWidth
        const h = item.offsetHeight
        const [l, t] = that.formatTransformVal(item.style.transform)
        const r = l + w // 对齐目标right
        const b = t + h // 对齐目标的bottom

        //两组件，水平/垂直中线分别比较，判断是否小于snapTolerance
        const hc = Math.abs((activeTop + height / 2) - (t + h / 2)) <= that.snapTolerance // 水平中线
        const vc = Math.abs((activeLeft + width / 2) - (l + w / 2)) <= that.snapTolerance // 垂直中线

        //两组件，上下边线，分别比较
        const ts = Math.abs(t - activeBottom) <= that.snapTolerance // 从上到下
        const TS = Math.abs(b - activeBottom) <= that.snapTolerance // 从上到下
        const bs = Math.abs(t - activeTop) <= that.snapTolerance // 从下到上
        const BS = Math.abs(b - activeTop) <= that.snapTolerance // 从下到上
        // 添加item中线与激活元素边线
        const hts = Math.abs((t + h / 2) - activeTop) <= that.snapTolerance
        const Hbs = Math.abs((t + h / 2) - activeBottom) <= that.snapTolerance

        //左右边线分别比较
        const ls = Math.abs(l - activeRight) <= that.snapTolerance // 外左
        const LS = Math.abs(r - activeRight) <= that.snapTolerance // 外左
        const rs = Math.abs(l - activeLeft) <= that.snapTolerance // 外右
        const RS = Math.abs(r - activeLeft) <= that.snapTolerance // 外右
        // 添加item中线与激活元素边线
        const vls = Math.abs((l + w / 2) - activeLeft) <= that.snapTolerance
        const Vrs = Math.abs((l + w / 2) - activeRight) <= that.snapTolerance

        tem['display'] = [ts, TS, bs, BS, hc, hc,
          hts, Hbs,
          ls, LS, rs, RS, vc, vc,
          vls, Vrs]//是否显示

        tem['position'] = [t, b, t, b, t + h / 2, t + h / 2,
          t + h / 2, t + h / 2,
          l, r, l, r, l + w / 2, l + w / 2,
          l + w / 2, l + w / 2]

        // bln_=item.id=="editor"?false:bln;
        //吸附，标线显示范围计算
        let f = true;
        if (ts) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('b')) {
                that.bottom = that.parentHeight - t;
              }
            } else {
              that.top = t - height
              that.bottom = that.parentHeight - that.top - height
            }
          }
          tem.value.y[0].push(l, r, activeLeft, activeRight)
        }
        if (bs) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('t')) {
                that.top = t;
              }
            } else {
              that.top = t
              that.bottom = that.parentHeight - that.top - height
            }
          }
          tem.value.y[0].push(l, r, activeLeft, activeRight)
        }
        if (TS) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('b')) {
                that.bottom = that.parentHeight - b;
              }
            } else {
              that.top = b - height
              that.bottom = that.parentHeight - that.top - height
            }

          }
          tem.value.y[1].push(l, r, activeLeft, activeRight)
        }
        if (BS) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('t')) {
                that.top = b
              }
            } else {
              that.top = b
              that.bottom = that.parentHeight - that.top - height
            }
          }
          tem.value.y[1].push(l, r, activeLeft, activeRight)
        }

        if (ls) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('r')) {
                that.right = that.parentWidth - l;
              }
            } else {
              that.left = l - width
              that.right = that.parentWidth - that.left - width
            }
          }
          tem.value.x[0].push(t, b, activeTop, activeBottom)
        }
        if (rs) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('l')) {
                that.left = l;
              }
            } else {
              that.left = l
              that.right = that.parentWidth - that.left - width
            }
          }
          tem.value.x[0].push(t, b, activeTop, activeBottom)
        }
        if (LS) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('r')) {
                that.right = that.parentWidth - r;
              }
            } else {
              that.left = r - width
              that.right = that.parentWidth - that.left - width
            }
          }
          tem.value.x[1].push(t, b, activeTop, activeBottom)
        }
        if (RS) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('l')) {
                that.left = r;
              }
            } else {
              that.left = r
              that.right = that.parentWidth - that.left - width
            }
          }
          tem.value.x[1].push(t, b, activeTop, activeBottom)
        }
        if (hc) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('t')) {
                that.top = b + t - that.parentHeight + that.bottom
              } else if (that.handle.includes('b')) {
                that.bottom = that.parentHeight + that.top - b - t
              }
            } else {
              that.top = t + h / 2 - height / 2
              that.bottom = that.parentHeight - that.top - height
            }
          }
          tem.value.y[2].push(l, r, activeLeft, activeRight)
        }
        if (vc) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('l')) {
                that.left = r + l - that.parentWidth + that.right
              } else if (that.handle.includes('r')) {
                that.right = that.left + that.parentWidth - r - l
              }
            } else {
              that.left = l + w / 2 - width / 2
              that.right = that.parentWidth - that.left - width
            }
          }
          tem.value.x[2].push(t, b, activeTop, activeBottom)
        }

        // 添加中线与边线对齐
        if (hts) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('t')) {
                that.top = t + h / 2;
              }
            } else {
              that.top = t + h / 2;
              that.bottom = that.parentHeight - that.top - height;
            }
          }
          tem.value.y[2].push(l, r, activeLeft, activeRight)
        }
        if (Hbs) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('b')) {
                that.bottom = that.parentHeight - t - h / 2
              }
            } else {
              that.top = t + h / 2 - height;
              that.bottom = that.parentHeight - that.top - height;
            }
          }
          tem.value.y[2].push(l, r, activeLeft, activeRight)
        }
        if (vls) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('l')) {
                that.left = l + w / 2
              }
            } else {
              that.left = l + w / 2
              that.right = that.parentWidth - that.left - width
            }
          }
          tem.value.x[2].push(t, b, activeTop, activeBottom)
        }
        if (Vrs) {
          if (f && bln) {
            if (that.handle) {
              if (that.handle.includes('r')) {
                that.right = that.parentWidth - l - w / 2
              }
            } else {
              that.left = l + w / 2 - width
              that.right = that.parentWidth - that.left - width
            }
          }
          tem.value.x[2].push(t, b, activeTop, activeBottom)
        }

        // 辅助线坐标与是否显示(display)对应的数组,易于循环遍历
        const arrTem = [0, 1, 0, 1, 2, 2,
          2, 2,
          0, 1, 0, 1, 2, 2,
          2, 2
        ]
        for (let i = 0; i <= arrTem.length; i++) {
          // 前6为Y辅助线,后6为X辅助线
          const xory = i < 8 ? 'y' : 'x'
          const horv = i < 8 ? 'hLine' : 'vLine'



          if (tem.display[i]) {
            const { origin, length } = that.calcLineValues(tem.value[xory][arrTem[i]])
            refLine[horv][arrTem[i]].display = tem.display[i]
            refLine[horv][arrTem[i]].position = tem.position[i] + 'px'
            refLine[horv][arrTem[i]].origin = origin
            refLine[horv][arrTem[i]].lineLength = length
          }
        }
      }
    }
    // this.$emit('refLineParams', refLine)
  }
}