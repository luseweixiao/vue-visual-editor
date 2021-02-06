<template>
  <div class="draggable-container"
       @click="selectCurrComponent"
       @mousedown="handleMouseDownOnContainer">
    <div class="point"
         v-for="(item,index) in (active? pointList:[])"
         :key="index"
         :style="getPointStyle(item)"
         @mousedown="handleMouseDownOnPoint(item, $event)"></div>
    <slot></slot>
  </div>
</template>

<script>
import eventBus from '@/utils/eventBus'
import calculateComponentPositonAndSize from '@/utils/calculateComponentPositonAndSize'
import { mapState } from "vuex"
export default {
  props: {
    defaultStyle: {
      require: true,
      type: Object,
    },
    index: {
      require: true,
      type: Number,
    },
    active: {
      require: true,
      type: Boolean
    },
    element: {
      require: true,
      type: Object,
    }
  },
  data () {
    return {
      pointList: ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'],
      initialAngle: { // 每个点对应的初始角度
        lt: 0,
        t: 45,
        rt: 90,
        r: 135,
        rb: 180,
        b: 225,
        lb: 270,
        l: 315,
      },
      angleToCursor: [ // 每个范围的角度对应的光标
        { start: 338, end: 23, cursor: 'nw' },
        { start: 23, end: 68, cursor: 'n' },
        { start: 68, end: 113, cursor: 'ne' },
        { start: 113, end: 158, cursor: 'e' },
        { start: 158, end: 203, cursor: 'se' },
        { start: 203, end: 248, cursor: 's' },
        { start: 248, end: 293, cursor: 'sw' },
        { start: 293, end: 338, cursor: 'w' },
      ],
      cursors: {},
    }
  },
  methods: {
    checkEdge (style, point) {
      // ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'],
      let result = false;
      switch (point) {
        case 'lt':
          if (style.left <= 0 || style.top <= 0) {
            result = true;
          }
          break;
        case 't':
          if (style.top <= 0) {
            result = true;
          }
          break;
      }
      return result;
    },
    selectCurrComponent (e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit("setCurrComponent", { component: this.element, index: this.index });
    },
    getCursor () {
      const { angleToCursor, initialAngle, pointList } = this;
      const rotate = (this.currComponent.style.rotate + 360) % 360; // 防止角度有负数，所以 + 360
      const result = {};
      let lastMatchIndex = -1 // 从上一个命中的角度的索引开始匹配下一个，降低时间复杂度
      pointList.forEach(point => {
        const angle = (initialAngle[point] + rotate) % 360;
        const len = angleToCursor.length;
        let tag = true;
        while (tag) {
          lastMatchIndex = (lastMatchIndex + 1) % len;
          const angleLimit = angleToCursor[lastMatchIndex];
          if (angle < 23 || angle >= 338) {
            result[point] = 'nw-resize';
            return
          }
          if (angleLimit.start <= angle && angle < angleLimit.end) {
            result[point] = angleLimit.cursor + '-resize';
            return
          }
        }
      })
      return result;
    },
    handleMouseDownOnContainer (e) {

      if (this.element.component != "u-text") {
        e.preventDefault();
      }
      e.stopPropagation();
      this.$store.commit("setCurrComponent", { component: this.element, index: this.index });
      this.cursors = this.getCursor();

      let pos = { ...this.defaultStyle };
      // e.target 为对应component
      const startY = e.clientY;
      const startX = e.clientX;
      // 如果直接修改属性，值的类型会变为字符串，所以要转为数值型
      const startTop = Number(pos.top);
      const startLeft = Number(pos.left);
      // 如果元素没有移动，则不保存快照
      // let hasMove = false;
      const move = (moveEvent) => {
        // hasMove = true;
        const curX = moveEvent.clientX;
        const curY = moveEvent.clientY;

        // 原始top+移动距离
        pos.top = curY - startY + startTop;
        pos.left = curX - startX + startLeft;

        pos = this.setPos(pos);//将组件限制在编辑器区

        // 修改当前组件样式
        // console.log("pos", pos)
        this.$store.commit('setShapeStyle', pos)
        // 等更新完当前组件的样式并绘制到屏幕后再判断是否需要吸附
        // 如果不使用 $nextTick，吸附后将无法移动
        this.$nextTick(() => {
          // 触发元素移动事件，用于显示标线、吸附功能
          // 后面两个参数代表鼠标移动方向
          // curY - startY > 0 true 表示向下移动 false 表示向上移动
          // curX - startX > 0 true 表示向右移动 false 表示向左移动
          eventBus.$emit('move', curY - startY > 0, curX - startX > 0)
          console.log("handleMouseDownOnContainer")
        })
      }
      const up = () => {
        // hasMove && this.$store.commit('recordSnapshot')
        // 触发元素停止移动事件，用于隐藏标线
        eventBus.$emit('unmove')
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    handleMouseDownOnPoint (point, e) {
      const downEvent = window.event
      downEvent.stopPropagation()
      downEvent.preventDefault()

      const style = { ...this.defaultStyle };

      const center = {
        x: style.left + style.width / 2,
        y: style.top + style.height / 2,
      }
      // 获取画布位移信息
      const editorRectInfo = document.querySelector('#editor').getBoundingClientRect();
      // 当前点击坐标
      const curPoint = {
        x: e.clientX - editorRectInfo.left,
        y: e.clientY - editorRectInfo.top,
      }
      // 获取对称点的坐标
      const symmetricPoint = {
        x: center.x - (curPoint.x - center.x),
        y: center.y - (curPoint.y - center.y),
      }
      // 是否需要保存快照
      // let needSave = false
      let isFirst = true
      const move = (moveEvent) => {
        // 第一次点击时也会触发 move，所以会有“刚点击组件但未移动，组件的大小却改变了”的情况发生
        // 因此第一次点击时不触发 move 事件
        if (isFirst) {
          isFirst = false
          return
        }
        // if (this.checkEdge(style, point)) return;
        // needSave = true
        const curPositon = {
          x: moveEvent.clientX - editorRectInfo.left,
          y: moveEvent.clientY - editorRectInfo.top,
        }
        //center 点击是的组件中心点在editor中的坐标
        //curPoint 点击时在eidtor中的坐标
        //curPosition 实时点击点在eidtor中的坐标
        //symmetricPoint 
        calculateComponentPositonAndSize(point, style, curPositon, {
          center,
          curPoint,
          symmetricPoint,
        })
        this.$store.commit('setShapeStyle', style)
      }
      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        // needSave && this.$store.commit('recordSnapshot')
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },

    getPointStyle (point) {
      const { width, height } = this.defaultStyle;
      const hasT = /t/.test(point);
      const hasB = /b/.test(point);
      const hasL = /l/.test(point);
      const hasR = /r/.test(point);
      let newLeft = 0;
      let newTop = 0;
      // 四个角的点
      if (point.length === 2) {
        newLeft = hasL ? 0 : width;
        newTop = hasT ? 0 : height;
      } else {
        // 上下两点的点，宽度居中
        if (hasT || hasB) {
          newLeft = width / 2;
          newTop = hasT ? 0 : height;
        }
        // 左右两边的点，高度居中
        if (hasL || hasR) {
          newLeft = hasL ? 0 : width;
          newTop = Math.floor(height / 2);
        }
      }

      const style = {
        marginLeft: hasR ? '-4px' : '-4px',
        marginTop: '-4px',
        left: `${newLeft}px`,
        top: `${newTop}px`,
        cursor: this.cursors[point],
      }

      return style
    },
    //根据编辑区限制组件位置
    setPos (pos) {
      var { top, left } = pos;
      if (top < 0) {
        top = 0;
      } else if (top + this.currComponent.style.height > this.$store.state.editorStyleData.height) {
        top = this.$store.state.editorStyleData.height - this.currComponent.style.height;
      }

      if (left < 0) {
        left = 0;
      } else if (left + this.currComponent.style.width > this.$store.state.editorStyleData.width) {
        left = this.$store.state.editorStyleData.width - this.currComponent.style.width;
      }

      return { top, left };
    },
  },
  computed: {

    ...mapState(["currComponentIndex", "editorStyleData", "currComponent"]),
    // currComponent () {
    //   var currCom = (this.pageList.length > 0 && this.pageList[this.currPageIndex] != null) ? this.pageList[this.currPageIndex].componentsData[this.currComponentIndex] : null;
    //   return currCom;
    // },
  }
}
</script>

<style scoped>
.draggable-container {
  position: absolute;
}
.point {
  position: absolute;
  background: #fff;
  border: 1px solid #59c7f9;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>