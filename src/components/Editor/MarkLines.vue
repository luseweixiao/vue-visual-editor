<template>
  <div class="mark-line">
    <div v-for="(line,index) in lines.x"
         :key="'x-'+index"
         class="line xline"
         :ref="line"
         v-show="line || false"
         :style="{left:line && line.position + 'px'}"></div>
    <div v-for="(line,index) in lines.y"
         :key="'y-'+index"
         class="line yline"
         :ref="line"
         v-show="line || false"
         :style="{top:line && line.position + 'px'}"></div>
  </div>
</template>
<script>
import eventBus from '@/utils/eventBus'
import { mapState } from "vuex"
export default {
  data () {
    return {
      // lines: ['xt', 'xc', 'xb', 'yl', 'yc', 'yr'], // 分别对应三条横线和三条竖线
      lines: {
        x: [],
        y: []
      },
      diff: 6, // 相距 dff 像素将自动吸附
      lineStatus: {
        xt: false,
        xc: false,
        xb: false,
        yl: false,
        yc: false,
        yr: false,
      },
    }
  },
  mounted () {
    // 监听元素移动和不移动的事件
    eventBus.$on('move', (item) => {
      console.log("move", item)
      // this.showLine()
      let lines = this.lineDisplay();
      // console.log(lines)
      this.lines.x = lines.x;
      this.lines.y = lines.y;
      this.absorb(item)

    })
    eventBus.$on('unmove', () => {
      // this.hideLine()
    })
  },
  methods: {
    hideLine () {
      Object.keys(this.lineStatus).forEach(line => {
        this.lineStatus[line] = false
      })
    },

    absorb (item,handle) {
      //根据handle来进行吸附
      let drag = true;
      // let component = this.currComponent;
      if (drag) {
        let x = this.lines.x;
        let xIndex = -1;
        let minDet = this.snapTolerance

        // console.log(this.lines.x)
        for (let i = 0; i < 3; i++) {
          if (!x[i]) continue;
          if (x[i].det < minDet) {
            minDet = x[i].det;
            xIndex = i;
          }
        }
        // console.log(xIndex, minDet)
        if (xIndex != -1) {
          switch (xIndex) {
            case 0:
              item.style.left = this.lines.x[xIndex].position;
              // console.log("sorb")
              // this.$store.commit("setCurrComponent", { component, index: this.currComponentIndex })
              // this.$emit("changeStyle", [item.style.left, item.style.top, item.style.width, item.style.height])
              this.$emit("changeStyle", item)

              break;
          }
        }

      }

    },
    lineDisplay () {
      const coms = this.currPageComponents;
      let len = (coms.length + 1) * 3;
      let display = {
        x: [[], [], []],
        y: [[], [], []]
      };//display

      let xMin = Math.max(this.currComStyle.x[0] - this.snapTolerance, 0)
      let xMax = Math.min(this.currComStyle.x[2] + this.snapTolerance, this.currPageStyle.width)
      let yMin = Math.max(this.currComStyle.y[0] - this.snapTolerance, 0)
      let yMax = Math.min(this.currComStyle.y[2] + this.snapTolerance, this.currPageStyle.height)
      let XY = this.componentsXY();
      let X = XY.x;
      let Y = XY.y;
      let x = this.currComStyle.x;
      let y = this.currComStyle.y;

      for (let j = 0; j < 3; j++) {//左中右
        for (let i = 0; i < len; i++) {
          if (X[i].index != this.currComponentIndex && X[i].position >= xMin && X[i].position <= xMax) {
            let detX = Math.abs(X[i].position - x[j])

            if (detX < this.snapTolerance) {
              display.x[j].push({ position: X[i].position, det: detX })
            }
          }
        }
      }

      for (let j = 0; j < 3; j++) {//
        for (let i = 0; i < len; i++) {

          if (Y[i].index != this.currComponentIndex && Y[i].position >= yMin && Y[i].position <= yMax) {
            let detY = Math.abs(Y[i].position - y[j])
            if (detY < this.snapTolerance) {
              display.y[j].push({ position: Y[i].position, det: detY })
            }
          }
        }
      }

      display.x[0].sort((a, b) => a.det - b.det);
      display.x[1].sort((a, b) => a.det - b.det);
      display.x[2].sort((a, b) => a.det - b.det);
      display.y[0].sort((a, b) => a.det - b.det);
      display.y[1].sort((a, b) => a.det - b.det);
      display.y[2].sort((a, b) => a.det - b.det);


      return {
        x: [display.x[0][0], display.x[1][0], display.x[2][0]],
        y: [display.y[0][0], display.y[1][0], display.y[2][0]],
      }
    },
    componentsXY () {
      const coms = this.currPageComponents;
      let XY = {
        x: [],
        y: []
      };//position,display,index
      let len = coms.length;

      for (let i = 0; i < len; i++) {
        let currComStyle = coms[i].style;

        XY.x.push({ position: currComStyle.left, index: i })
        XY.x.push({ position: currComStyle.left + currComStyle.width / 2, index: i })
        XY.x.push({ position: currComStyle.left + currComStyle.width, index: i })

        XY.y.push({ position: currComStyle.top, index: i })//上
        XY.y.push({ position: currComStyle.top + currComStyle.height / 2, index: i })//中
        XY.y.push({ position: currComStyle.top + currComStyle.height, index: i })//下
      }
      //编辑器边线及中线
      XY.x.push({ position: 0, index: -1 })
      XY.x.push({ position: this.currPageStyle.width / 2, index: -1 })
      XY.x.push({ position: this.currPageStyle.width, index: -1 })

      XY.y.push({ position: 0, index: -1 })
      XY.y.push({ position: this.currPageStyle.height / 2, index: -1 })
      XY.y.push({ position: this.currPageStyle.height, index: -1 })

      XY.x.sort((a, b) => { a.position - b.position });
      XY.y.sort((a, b) => { a.position - b.position });
      return XY;
    },
  },
  computed: {
    ...mapState(["currComponent", "pageList", "currPageIndex", "currComponentIndex", "snapTolerance"]),
    currPageStyle () {
      return this.pageList[this.currPageIndex].style;
    },
    currPageComponents () {
      return this.pageList[this.currPageIndex].componentsData
    },


    currComStyle () {
      let style = this.currComponent.style;
      return {
        x: [style.left, style.left + style.width / 2, style.left + style.width],
        y: [style.top, style.top + style.height / 2, style.top + style.height]
      }
    },


  }
}

</script>
<style lang="scss" scoped>
.mark-line {
  height: 100%;
}
.line {
  background: #59c7f9;
  position: absolute;
  z-index: 1000;
}
.yline {
  width: 100%;
  height: 1px;
}
.xline {
  width: 1px;
  height: 100%;
}
</style>
