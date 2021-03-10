<template>
  <div :style="style"
       :class="[{
      [classNameActive]: enabled,
      [classNameDragging]: dragging,
      [classNameResizing]: resizing,
      [classNameDraggable]: draggable,
      [classNameResizable]: resizable
    }, className]"
       @mousedown="elementMouseDown"
       @touchstart="elementTouchDown">
    <div v-for="handle in actualHandles"
         :key="handle"
         :class="[classNameHandle, classNameHandle + '-' + handle]"
         :style="handleStyle(handle)"
         @mousedown.stop.prevent="handleDown(handle, $event)"
         @touchstart.stop.prevent="handleTouchDown(handle, $event)">
      <slot :name="handle"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { matchesSelectorToParentElements, getComputedSize, addEvent, removeEvent } from '@/utils/dom'
import { computeWidth, computeHeight, restrictToBounds, snapToGrid } from '@/utils/fns'
import { debounce } from "lodash"

const events = {
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  },
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  }
}

// 禁止用户选取
const userSelectNone = {
  userSelect: 'none',
  MozUserSelect: 'none',
  WebkitUserSelect: 'none',
  MsUserSelect: 'none'
}
// 用户选中自动
const userSelectAuto = {
  userSelect: 'auto',
  MozUserSelect: 'auto',
  WebkitUserSelect: 'auto',
  MsUserSelect: 'auto'
}

let eventsFor = events.mouse

export default {
  replace: true,
  name: 'vue-draggable-resizable',
  props: {
    className: {
      type: String,
      default: 'vdr'
    },
    classNameDraggable: {
      type: String,
      default: 'draggable'
    },
    classNameResizable: {
      type: String,
      default: 'resizable'
    },
    classNameDragging: {
      type: String,
      default: 'dragging'
    },
    classNameResizing: {
      type: String,
      default: 'resizing'
    },
    classNameActive: {
      type: String,
      default: 'active'
    },
    classNameHandle: {
      type: String,
      default: 'handle'
    },
    disableUserSelect: {
      type: Boolean,
      default: true
    },
    enableNativeDrag: {
      type: Boolean,
      default: false
    },
    preventDeactivation: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: true
    },
    resizable: {
      type: Boolean,
      default: true
    },
    // 锁定宽高比
    lockAspectRatio: {
      type: Boolean,
      default: false
    },
    w: {
      type: [Number, String],
      default: 200,
      validator: (val) => {
        if (typeof val === 'number') {
          return val > 0
        }
        return val === 'auto'
      }
    },
    h: {
      type: [Number, String],
      default: 200,
      validator: (val) => {
        if (typeof val === 'number') {
          return val > 0
        }
        return val === 'auto'
      }
    },
    minWidth: {
      type: Number,
      default: 0,
      validator: (val) => val >= 0
    },
    minHeight: {
      type: Number,
      default: 0,
      validator: (val) => val >= 0
    },
    maxWidth: {
      type: Number,
      default: null,
      validator: (val) => val >= 0
    },
    maxHeight: {
      type: Number,
      default: null,
      validator: (val) => val >= 0
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    z: {
      type: [String, Number],
      default: 'auto',
      validator: (val) => (typeof val === 'string' ? val === 'auto' : val >= 0)
    },
    handles: {
      type: Array,
      default: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
      validator: (val) => {
        const s = new Set(['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'])

        return new Set(val.filter(h => s.has(h))).size === val.length
      }
    },
    dragHandle: {
      type: String,
      default: null
    },
    dragCancel: {
      type: String,
      default: null
    },
    axis: {
      type: String,
      default: 'both',
      validator: (val) => ['x', 'y', 'both'].includes(val)
    },
    grid: {
      type: Array,
      default: () => [1, 1]
    },
    parent: {
      type: [Boolean, String],
      default: false
    },
    onDragStart: {
      type: Function,
      default: () => true
    },
    onDrag: {
      type: Function,
      default: () => true
    },
    onResizeStart: {
      type: Function,
      default: () => true
    },
    onResize: {
      type: Function,
      default: () => true
    },
    // 冲突检测
    isConflictCheck: {
      type: Boolean, default: false
    },
    // 元素对齐
    snap: {
      type: Boolean, default: false
    },
    // 当调用对齐时，用来设置组件与组件之间的对齐距离，以像素为单位
    snapTolerance: {
      type: Number,
      default: 5,
      validator: function (val) {
        return typeof val === 'number'
      }
    },
    // 缩放比例
    scaleRatio: {
      type: Number,
      default: 1,
      validator: (val) => typeof val === 'number'
    },
    // handle是否缩放
    handleInfo: {
      type: Object,
      default: () => {
        return {
          size: 8,
          offset: -5,
          switch: true
        }
      }
    }
  },

  data: function () {
    return {
      left: this.x,
      top: this.y,
      right: null,
      bottom: null,

      width: null,
      height: null,
      widthTouched: false,
      heightTouched: false,
      aspectFactor: null,

      parentWidth: null,
      parentHeight: null,

      minW: this.minWidth,
      minH: this.minHeight,

      maxW: this.maxWidth,
      maxH: this.maxHeight,

      handle: null,
      enabled: this.active,
      resizing: false,
      dragging: false,
      zIndex: this.z,
      XY: {
        x: [],
        y: []
      }
    }
  },

  created: function () {

    if (this.maxWidth && this.minWidth > this.maxWidth) console.warn('[Vdr warn]: Invalid prop: minWidth cannot be greater than maxWidth')
    if (this.maxWidth && this.minHeight > this.maxHeight) console.warn('[Vdr warn]: Invalid prop: minHeight cannot be greater than maxHeight')

    this.resetBoundsAndMouseState()
  },
  mounted: function () {
    if (!this.enableNativeDrag) {
      this.$el.ondragstart = () => false
    }

    const [parentWidth, parentHeight] = this.getParentSize()

    this.parentWidth = parentWidth
    this.parentHeight = parentHeight
    const [width, height] = getComputedSize(this.$el)
    this.aspectFactor = (this.w !== 'auto' ? this.w : width) / (this.h !== 'auto' ? this.h : height)
    this.width = this.w !== 'auto' ? this.w : width
    this.height = this.h !== 'auto' ? this.h : height
    this.right = this.parentWidth - this.width - this.left
    this.bottom = this.parentHeight - this.height - this.top

    this.settingAttribute()

    addEvent(document.documentElement, 'mousedown', this.deselect)
    addEvent(document.documentElement, 'touchend touchcancel', this.deselect)

    addEvent(window, 'resize', this.checkParentSize)
  },
  beforeDestroy: function () {
    removeEvent(document.documentElement, 'mousedown', this.deselect)
    removeEvent(document.documentElement, 'touchstart', this.handleUp)
    removeEvent(document.documentElement, 'mousemove', this.move)
    removeEvent(document.documentElement, 'touchmove', this.move)
    removeEvent(document.documentElement, 'mouseup', this.handleUp)
    removeEvent(document.documentElement, 'touchend touchcancel', this.deselect)

    removeEvent(window, 'resize', this.checkParentSize)
  },

  methods: {
    // 重置边界和鼠标状态
    resetBoundsAndMouseState () {
      this.mouseClickPosition = { mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 }

      this.bounds = {
        minLeft: null,
        maxLeft: null,
        minRight: null,
        maxRight: null,
        minTop: null,
        maxTop: null,
        minBottom: null,
        maxBottom: null
      }
    },
    // 检查父元素大小
    checkParentSize () {
      if (this.parent) {
        const [newParentWidth, newParentHeight] = this.getParentSize()
        // 修复父元素改变大小后，组件resizing时活动异常
        this.right = newParentWidth - this.width - this.left
        this.bottom = newParentHeight - this.height - this.top

        this.parentWidth = newParentWidth
        this.parentHeight = newParentHeight
      }
    },
    // 获取父元素大小
    getParentSize () {
      if (this.parent === true) {
        const style = window.getComputedStyle(this.$el.parentNode, null)
        return [
          parseInt(style.getPropertyValue('width'), 10),
          parseInt(style.getPropertyValue('height'), 10)
        ]
      }
      if (typeof this.parent === 'string') {
        const parentNode = document.querySelector(this.parent)
        if (!(parentNode instanceof HTMLElement)) {
          throw new Error(`The selector ${this.parent} does not match any element`)
        }
        return [parentNode.offsetWidth, parentNode.offsetHeight]
      }

      return [null, null]
    },
    // 元素触摸按下
    elementTouchDown (e) {
      eventsFor = events.touch

      this.elementDown(e)
    },
    elementMouseDown (e) {
      eventsFor = events.mouse
      this.elementDown(e)
    },
    // 元素按下
    elementDown (e) {
      if (e instanceof MouseEvent && e.which !== 1) {
        return
      }

      const target = e.target || e.srcElement

      if (this.$el.contains(target)) {
        if (this.onDragStart(e) === false) {
          return
        }

        if (
          (this.dragHandle && !matchesSelectorToParentElements(target, this.dragHandle, this.$el)) ||
          (this.dragCancel && matchesSelectorToParentElements(target, this.dragCancel, this.$el))
        ) {
          this.dragging = false

          return
        }

        if (!this.enabled) {
          this.enabled = true

          this.$emit('activated')
          this.$emit('update:active', true)
        }

        if (this.draggable) {
          this.dragging = true
        }

        this.mouseClickPosition.mouseX = e.touches ? e.touches[0].pageX : e.pageX
        this.mouseClickPosition.mouseY = e.touches ? e.touches[0].pageY : e.pageY

        this.mouseClickPosition.left = this.left
        this.mouseClickPosition.right = this.right
        this.mouseClickPosition.top = this.top
        this.mouseClickPosition.bottom = this.bottom
        this.mouseClickPosition.w = this.width
        this.mouseClickPosition.h = this.height

        if (this.parent) {
          this.bounds = this.calcDragLimits()
        }

        addEvent(document.documentElement, eventsFor.move, this.move)
        addEvent(document.documentElement, eventsFor.stop, this.handleUp)
      }
    },
    // 计算移动范围
    calcDragLimits () {
      return {
        minLeft: this.left % this.grid[0],
        maxLeft: Math.floor((this.parentWidth - this.width - this.left) / this.grid[0]) * this.grid[0] + this.left,
        minRight: this.right % this.grid[0],
        maxRight: Math.floor((this.parentWidth - this.width - this.right) / this.grid[0]) * this.grid[0] + this.right,
        minTop: this.top % this.grid[1],
        maxTop: Math.floor((this.parentHeight - this.height - this.top) / this.grid[1]) * this.grid[1] + this.top,
        minBottom: this.bottom % this.grid[1],
        maxBottom: Math.floor((this.parentHeight - this.height - this.bottom) / this.grid[1]) * this.grid[1] + this.bottom
      }
    },
    // 取消
    deselect (e) {

      const target = e.target || e.srcElement
      const regex = new RegExp(this.className + '-([trmbl]{2})', '')
      if (!this.$el.contains(target) && !regex.test(target.className)) {
        if (this.enabled && !this.preventDeactivation) {
          this.enabled = false

          this.$emit('deactivated')
          this.$emit('update:active', false)
        }

        removeEvent(document.documentElement, eventsFor.move, this.handleResize)
      }

      this.resetBoundsAndMouseState()
    },
    // 控制柄触摸按下
    handleTouchDown (handle, e) {
      eventsFor = events.touch

      this.handleDown(handle, e)
    },
    // 控制柄按下
    handleDown (handle, e) {
      if (e instanceof MouseEvent && e.which !== 1) {
        return
      }

      if (this.onResizeStart(handle, e) === false) {
        return
      }

      if (e.stopPropagation) e.stopPropagation()

      // Here we avoid a dangerous recursion by faking
      // corner handles as middle handles
      if (this.lockAspectRatio && !handle.includes('m')) {
        this.handle = 'm' + handle.substring(1)
      } else {
        this.handle = handle
      }
      this.resizing = true
      this.mouseClickPosition.mouseX = e.touches ? e.touches[0].pageX : e.pageX
      this.mouseClickPosition.mouseY = e.touches ? e.touches[0].pageY : e.pageY
      this.mouseClickPosition.left = this.left
      this.mouseClickPosition.right = this.right
      this.mouseClickPosition.top = this.top
      this.mouseClickPosition.bottom = this.bottom
      this.mouseClickPosition.w = this.width
      this.mouseClickPosition.h = this.height

      this.bounds = this.calcResizeLimits()

      addEvent(document.documentElement, eventsFor.move, this.handleResize)
      addEvent(document.documentElement, eventsFor.stop, this.handleUp)
    },
    // 计算调整大小范围
    calcResizeLimits () {
      let minW = this.minW
      let minH = this.minH
      let maxW = this.maxW
      let maxH = this.maxH

      const aspectFactor = this.aspectFactor
      const [gridX, gridY] = this.grid
      const width = this.width
      const height = this.height
      const left = this.left
      const top = this.top
      const right = this.right
      const bottom = this.bottom

      if (this.lockAspectRatio) {
        if (minW / minH > aspectFactor) {
          minH = minW / aspectFactor
        } else {
          minW = aspectFactor * minH
        }

        if (maxW && maxH) {
          maxW = Math.min(maxW, aspectFactor * maxH)
          maxH = Math.min(maxH, maxW / aspectFactor)
        } else if (maxW) {
          maxH = maxW / aspectFactor
        } else if (maxH) {
          maxW = aspectFactor * maxH
        }
      }

      maxW = maxW - (maxW % gridX)
      maxH = maxH - (maxH % gridY)

      const limits = {
        minLeft: null,
        maxLeft: null,
        minTop: null,
        maxTop: null,
        minRight: null,
        maxRight: null,
        minBottom: null,
        maxBottom: null
      }

      if (this.parent) {
        limits.minLeft = left % gridX
        limits.maxLeft = left + Math.floor((width - minW) / gridX) * gridX
        limits.minTop = top % gridY
        limits.maxTop = top + Math.floor((height - minH) / gridY) * gridY
        limits.minRight = right % gridX
        limits.maxRight = right + Math.floor((width - minW) / gridX) * gridX
        limits.minBottom = bottom % gridY
        limits.maxBottom = bottom + Math.floor((height - minH) / gridY) * gridY

        if (maxW) {
          limits.minLeft = Math.max(limits.minLeft, this.parentWidth - right - maxW)
          limits.minRight = Math.max(limits.minRight, this.parentWidth - left - maxW)
        }

        if (maxH) {
          limits.minTop = Math.max(limits.minTop, this.parentHeight - bottom - maxH)
          limits.minBottom = Math.max(limits.minBottom, this.parentHeight - top - maxH)
        }

        if (this.lockAspectRatio) {
          limits.minLeft = Math.max(limits.minLeft, left - top * aspectFactor)
          limits.minTop = Math.max(limits.minTop, top - left / aspectFactor)
          limits.minRight = Math.max(limits.minRight, right - bottom * aspectFactor)
          limits.minBottom = Math.max(limits.minBottom, bottom - right / aspectFactor)
        }
      } else {
        limits.minLeft = null
        limits.maxLeft = left + Math.floor((width - minW) / gridX) * gridX
        limits.minTop = null
        limits.maxTop = top + Math.floor((height - minH) / gridY) * gridY
        limits.minRight = null
        limits.maxRight = right + Math.floor((width - minW) / gridX) * gridX
        limits.minBottom = null
        limits.maxBottom = bottom + Math.floor((height - minH) / gridY) * gridY

        if (maxW) {
          limits.minLeft = -(right + maxW)
          limits.minRight = -(left + maxW)
        }

        if (maxH) {
          limits.minTop = -(bottom + maxH)
          limits.minBottom = -(top + maxH)
        }

        if (this.lockAspectRatio && (maxW && maxH)) {
          limits.minLeft = Math.min(limits.minLeft, -(right + maxW))
          limits.minTop = Math.min(limits.minTop, -(maxH + bottom))
          limits.minRight = Math.min(limits.minRight, -left - maxW)
          limits.minBottom = Math.min(limits.minBottom, -top - maxH)
        }
      }

      return limits
    },
    // 移动
    move (e) {
      if (this.dragging) {
        this.handleDrag(e);
      } else if (this.resizing) {
        debounce(() => {
          this.handleResize(e)
        }, 200)
      }
    },

    // 元素移动
    async handleDrag (e) {
      const axis = this.axis
      const grid = this.grid
      const bounds = this.bounds
      const mouseClickPosition = this.mouseClickPosition

      const tmpDeltaX = axis && axis !== 'y' ? mouseClickPosition.mouseX - (e.touches ? e.touches[0].pageX : e.pageX) : 0
      const tmpDeltaY = axis && axis !== 'x' ? mouseClickPosition.mouseY - (e.touches ? e.touches[0].pageY : e.pageY) : 0

      const [deltaX, deltaY] = snapToGrid(grid, tmpDeltaX, tmpDeltaY, this.scaleRatio)

      const left = restrictToBounds(mouseClickPosition.left - deltaX, bounds.minLeft, bounds.maxLeft)
      const top = restrictToBounds(mouseClickPosition.top - deltaY, bounds.minTop, bounds.maxTop)
      if (this.onDrag(left, top) === false) {
        return
      }
      const right = restrictToBounds(mouseClickPosition.right + deltaX, bounds.minRight, bounds.maxRight)
      const bottom = restrictToBounds(mouseClickPosition.bottom + deltaY, bounds.minBottom, bounds.maxBottom)
      this.left = left
      this.top = top
      this.right = right
      this.bottom = bottom

      await this.snapCheck()
      this.$emit('dragging', this.left, this.top)
    },
    moveHorizontally (val) {
      const [deltaX, _] = snapToGrid(this.grid, val, this.top, this.scale)
      const left = restrictToBounds(deltaX, this.bounds.minLeft, this.bounds.maxLeft)
      this.left = left
      this.right = this.parentWidth - this.width - left
    },
    moveVertically (val) {
      const [_, deltaY] = snapToGrid(this.grid, this.left, val, this.scale)
      const top = restrictToBounds(deltaY, this.bounds.minTop, this.bounds.maxTop)
      this.top = top
      this.bottom = this.parentHeight - this.height - top
    },
    // 控制柄移动
    async handleResize (e) {

      let left = this.left
      let top = this.top
      let right = this.right
      let bottom = this.bottom

      const mouseClickPosition = this.mouseClickPosition
      const lockAspectRatio = this.lockAspectRatio//是否锁定宽高比
      const aspectFactor = this.aspectFactor//初始宽高比

      const tmpDeltaX = mouseClickPosition.mouseX - (e.touches ? e.touches[0].pageX : e.pageX)
      const tmpDeltaY = mouseClickPosition.mouseY - (e.touches ? e.touches[0].pageY : e.pageY)

      if (!this.widthTouched && tmpDeltaX) {
        this.widthTouched = true
      }
      if (!this.heightTouched && tmpDeltaY) {
        this.heightTouched = true
      }
      const [deltaX, deltaY] = snapToGrid(this.grid, tmpDeltaX, tmpDeltaY, this.scaleRatio)

      if (this.handle.includes('b')) {
        bottom = restrictToBounds(
          mouseClickPosition.bottom + deltaY,
          this.bounds.minBottom,
          this.bounds.maxBottom
        )
        if (this.lockAspectRatio && this.resizingOnY) {
          right = this.right - (this.bottom - bottom) * aspectFactor
        }
      } else if (this.handle.includes('t')) {
        top = restrictToBounds(
          mouseClickPosition.top - deltaY,
          this.bounds.minTop,
          this.bounds.maxTop
        )
        if (this.lockAspectRatio && this.resizingOnY) {
          left = this.left - (this.top - top) * aspectFactor
        }
      }

      if (this.handle.includes('r')) {
        right = restrictToBounds(
          mouseClickPosition.right + deltaX,
          this.bounds.minRight,
          this.bounds.maxRight
        )
        if (this.lockAspectRatio && this.resizingOnX) {
          bottom = this.bottom - (this.right - right) / aspectFactor
        }
      } else if (this.handle.includes('l')) {
        left = restrictToBounds(
          mouseClickPosition.left - deltaX,
          this.bounds.minLeft,
          this.bounds.maxLeft
        )
        if (this.lockAspectRatio && this.resizingOnX) {
          top = this.top - (this.left - left) / aspectFactor
        }
      }
      this.left = left
      this.top = top
      this.right = right
      this.bottom = bottom

      const width = computeWidth(this.parentWidth, left, right)
      const height = computeHeight(this.parentHeight, top, bottom)

      await this.snapCheck({ activeLeft: left, activeRight: left + width, activeTop: top, activeBottom: top + height, width: width, height: height });

      if (this.onResize(this.handle, this.left, this.top, width, height) === false) {
        return
      }
      // this.left = left
      // this.top = top
      // this.right = right
      // this.bottom = bottom
      this.width = computeWidth(this.parentWidth, this.left, this.right)
      this.height = computeHeight(this.parentHeight, this.top, this.bottom)

      this.$emit('resizing', this.left, this.top, this.width, this.height)
    },
    changeWidth (val) {
      const [newWidth, _] = snapToGrid(this.grid, val, 0, this.scale)
      let right = restrictToBounds(
        (this.parentWidth - newWidth - this.left),
        this.bounds.minRight,
        this.bounds.maxRight
      )
      let bottom = this.bottom
      if (this.lockAspectRatio) {
        bottom = this.bottom - (this.right - right) / this.aspectFactor
      }
      const width = computeWidth(this.parentWidth, this.left, right)
      const height = computeHeight(this.parentHeight, this.top, bottom)
      this.right = right
      this.bottom = bottom
      this.width = width
      this.height = height
    },
    changeHeight (val) {
      const [_, newHeight] = snapToGrid(this.grid, 0, val, this.scale)
      let bottom = restrictToBounds(
        (this.parentHeight - newHeight - this.top),
        this.bounds.minBottom,
        this.bounds.maxBottom
      )
      let right = this.right
      if (this.lockAspectRatio) {
        right = this.right - (this.bottom - bottom) * this.aspectFactor
      }
      const width = computeWidth(this.parentWidth, this.left, right)
      const height = computeHeight(this.parentHeight, this.top, bottom)
      this.right = right
      this.bottom = bottom
      this.width = width
      this.height = height
    },
    // 从控制柄松开
    async handleUp (e) {
      this.handle = null

      // 初始化辅助线数据
      const temArr = new Array(3).fill({ display: false, position: '', origin: '', lineLength: '' })
      const refLine = { vLine: [], hLine: [] }
      for (let i in refLine) { refLine[i] = JSON.parse(JSON.stringify(temArr)) }

      if (this.resizing) {
        this.resizing = false
        await this.conflictCheck()
        this.$emit('refLineParams', refLine)
        this.$emit('resizestop', this.left, this.top, this.width, this.height)
      }
      if (this.dragging) {
        this.dragging = false
        await this.conflictCheck()
        this.$emit('refLineParams', refLine)
        this.$emit('dragstop', this.left, this.top)
      }
      this.resetBoundsAndMouseState()
      removeEvent(document.documentElement, eventsFor.move, this.handleResize)
    },
    // 新增方法 ↓↓↓
    // 设置属性
    settingAttribute () {
      // 设置冲突检测
      this.$el.setAttribute('data-is-check', `${this.isConflictCheck}`)
      // 设置对齐元素
      this.$el.setAttribute('data-is-snap', `${this.snap}`)
    },
    // 冲突检测
    conflictCheck () {
      const top = this.top
      const left = this.left
      const width = this.width
      const height = this.height

      if (this.isConflictCheck) {
        const nodes = this.$el.parentNode.childNodes // 获取当前父节点下所有子节点
        for (let item of nodes) {
          if (item.className !== undefined && !item.className.includes(this.classNameActive) && item.getAttribute('data-is-check') !== null && item.getAttribute('data-is-check') !== 'false') {
            const tw = item.offsetWidth
            const th = item.offsetHeight
            // 正则获取left与right
            let [tl, tt] = this.formatTransformVal(item.style.transform)

            // 左上角与右下角重叠
            const tfAndBr = (top >= tt && left >= tl && tt + th > top && tl + tw > left) || (top <= tt && left < tl && top + height > tt && left + width > tl)
            // 右上角与左下角重叠
            const brAndTf = (left <= tl && top >= tt && left + width > tl && top < tt + th) || (top < tt && left > tl && top + height > tt && left < tl + tw)
            // 下边与上边重叠
            const bAndT = (top <= tt && left >= tl && top + height > tt && left < tl + tw) || (top >= tt && left <= tl && top < tt + th && left > tl + tw)
            // 上边与下边重叠（宽度不一样）
            const tAndB = (top <= tt && left >= tl && top + height > tt && left < tl + tw) || (top >= tt && left <= tl && top < tt + th && left > tl + tw)
            // 左边与右边重叠
            const lAndR = (left >= tl && top >= tt && left < tl + tw && top < tt + th) || (top > tt && left <= tl && left + width > tl && top < tt + th)
            // 左边与右边重叠（高度不一样）
            const rAndL = (top <= tt && left >= tl && top + height > tt && left < tl + tw) || (top >= tt && left <= tl && top < tt + th && left + width > tl)

            // 如果冲突，就将回退到移动前的位置
            if (tfAndBr || brAndTf || bAndT || tAndB || lAndR || rAndL) {
              this.top = this.mouseClickPosition.top
              this.left = this.mouseClickPosition.left
              this.right = this.mouseClickPosition.right
              this.bottom = this.mouseClickPosition.bottom
              this.width = this.mouseClickPosition.w
              this.height = this.mouseClickPosition.h
            }
          }
        }
      }
    },
    // 检测对齐元素
    async snapCheck () {
      let width = this.width
      let height = this.height
      if (this.snap) {
        let activeLeft, activeRight, activeTop, activeBottom
        if (this.handle) {
          activeLeft = arguments[0].activeLeft;
          activeRight = arguments[0].activeRight;
          activeTop = arguments[0].activeTop;
          activeBottom = arguments[0].activeBottom;
          width = arguments[0].width;
          height = arguments[0].height;
        } else {
          activeLeft = this.left
          activeRight = this.left + width
          activeTop = this.top
          activeBottom = this.top + height
        }
        //这里主要是考虑多个活动元素的情况，整体移动时计算其整体区域
        // const { groupWidth, groupHeight, groupLeft, groupTop, bln } = await this.getActiveAll(nodes)
        // if (!bln) {
        //   width = groupWidth
        //   height = groupHeight
        //   activeLeft = groupLeft
        //   activeRight = groupLeft + groupWidth
        //   activeTop = groupTop
        //   activeBottom = groupTop + groupHeight
        // }
        this.lineDisplay([activeLeft, activeRight, activeTop, activeBottom, width, height])

      }
    },
    //[activeLeft, activeRight, activeTop, activeBottom, width, height]
    lineDisplay (active) {
      let activeLeft = active[0];
      let activeRight = active[1];
      let activeTop = active[2];
      let activeBottom = active[3];
      let width = active[4];
      let height = active[5];

      // const coms = this.currPageComponents;

      let display = {
        x: [[], [], []],
        y: [[], [], []]
      };//display

      let xMin = Math.max(activeLeft - this.snapTolerance, 0)
      let xMax = Math.min(activeRight + this.snapTolerance, this.parentWidth)
      let yMin = Math.max(activeTop - this.snapTolerance, 0)
      let yMax = Math.min(activeBottom + this.snapTolerance, this.parentHeight)
      // let XY = this.componentsXY();
      let XY = this.XY;
      let X = XY.x;
      let Y = XY.y;
      let len = X.length
      let x = [activeLeft, activeLeft + width / 2, activeRight];
      let y = [activeTop, activeTop + height / 2, activeBottom];

      const temArr = new Array(3).fill({ display: false, position: '' })
      const refLine = { vLine: [], hLine: [] }
      for (let i in refLine) { refLine[i] = JSON.parse(JSON.stringify(temArr)) }

      for (let j = 0; j < 3; j++) {//左中右
        for (let i = 0; i < len; i++) {
          if (X[i] >= xMin && X[i] <= xMax) {
            let detX = Math.abs(X[i] - x[j])

            if (detX < this.snapTolerance) {
              display.x[j].push({ position: X[i], det: detX })
            }
          }
        }
      }
      for (let j = 0; j < 3; j++) {//y:焦点元素边线，中线
        for (let i = 0; i < len; i++) {//Y：其他

          if (Y[i] >= yMin && Y[i] <= yMax) {
            let detY = Math.abs(Y[i] - y[j])
            if (detY < this.snapTolerance) {
              display.y[j].push({ position: Y[i], det: detY })
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
      let xIndex = -1, yIndex = -1;
      let detX = this.snapTolerance, detY = this.snapTolerance;
      //标线
      for (let i = 0; i < 3; i++) {
        // 取到最近的线，根据xIndex可以知道是左、中、右哪个最近
        if (display.x[i][0]) {
          if (display.x[i][0].det < detX) {
            xIndex = i;
            detX = display.x[i][0].det;
          }
          refLine['vLine'][i].display = true
          refLine['vLine'][i].position = display.x[i][0].position + 'px'
        }
        if (display.y[i][0]) {
          if (display.y[i][0].det < detY) {
            yIndex = i;
            detY = display.y[i][0].det
          }
          refLine['hLine'][i].display = true
          refLine['hLine'][i].position = display.y[i][0].position + 'px'
        }
      }
      //      if (this.dragging) {
      //   this.handleDrag(e);
      // } else if (this.resizing) {
      //   debounce(() => {
      //     this.handleResize(e)
      //   }, 200)
      // }
      // 吸附
      if (this.resizing) {
        switch (this.handle) {//resize
          case 'tl':
            if (display.x[0][0]) this.left = display.x[0][0].position;
            if (display.y[0][0]) this.top = display.y[0][0].position;
            break;
          case 'ml':
            if (display.x[0][0]) this.left = display.x[0][0].position;
            break;
          case "bl":
            // console.log("bl", display.x[0][0], display.y, this.left, this.right)
            if (display.x[0][0] != undefined) this.left = display.x[0][0].position;
            if (display.y[2][0]) this.bottom = this.parentHeight - display.y[2][0].position;
            // console.log("bl", display.x[0][0], display.y, this.left, this.right)
            break;
          case 'tr':
            if (display.x[2][0]) this.right = this.parentWidth - display.x[2][0].position;
            if (display.y[0][0]) this.top = display.y[0][0].position;
            break;
          case 'mr':
            if (display.x[2][0]) this.right = this.parentWidth - display.x[2][0].position;
            break;
          case "br":
            if (display.x[2][0]) this.right = this.parentWidth - display.x[2][0].position;
            if (display.y[2][0]) this.bottom = this.parentHeight - display.y[2][0].position;
            break;
          case 'bm':
            if (display.y[2][0]) this.bottom = this.parentHeight - display.y[2][0].position;
            break;
          case "tm":
            if (display.y[0][0]) this.top = display.y[0][0].position;
            break;
        }
      } else if (this.dragging) {
        // console.log("drag")
        switch (xIndex) {//drag
          case 0:
            this.left = display.x[0][0].position;
            this.right = this.parentWidth - this.left - width
            break;
          case 1:
            this.left = display.x[1][0].position - width / 2;
            this.right = this.parentWidth - display.x[1][0].position + width / 2
            break;
          case 2:
            this.right = this.parentWidth - display.x[2][0].position;
            this.left = display.x[2][0].position - width
            break;
        }
        switch (yIndex) {
          case 0:
            this.top = display.y[0][0].position;
            this.bottom = this.parentHeight - this.top - height
            break;
          case 1:
            this.top = display.y[1][0].position - height / 2;
            this.bottom = this.parentHeight - this.top - height / 2
            break;
          case 2:
            this.bottom = this.parentHeight - display.y[2][0].position;
            this.top = this.parentHeight - this.bottom - height
            break;
        }
      }
      this.$emit('refLineParams', refLine)

    },
    componentsXY () {

      let nodes = this.$el.parentNode.childNodes
      nodes = Array.prototype.slice.call(nodes);
      nodes.push(this.$el.parentNode)
      // let XY = {
      //   x: [],
      //   y: []
      // };//所有的边线，中线
      for (let item of nodes) {
        // console.log(this.classNameActive, item.className)
        if (item.className !== undefined && !item.className.includes(this.classNameActive) &&
          item.getAttribute('data-is-snap') !== null && item.getAttribute('data-is-snap') !== 'false' || item.id == "editor") {
          const w = item.offsetWidth
          const h = item.offsetHeight
          const [l, t] = this.formatTransformVal(item.style.transform)
          const r = l + w // 对齐目标right
          const b = t + h // 对齐目标的bottom

          this.XY.x.push(l)
          this.XY.x.push(l + w / 2)
          this.XY.x.push(r)

          this.XY.y.push(t)//上
          this.XY.y.push(t + h / 2)//中
          this.XY.y.push(b)//下
        }
        this.XY.x.sort();
        this.XY.y.sort();
      }
      // return XY;
    },

    calcLineValues (arr) {
      const length = Math.max(...arr) - Math.min(...arr) + 'px'
      const origin = Math.min(...arr) + 'px'
      return { length, origin }
    },
    async getActiveAll (nodes) {
      const activeAll = []
      const XArray = []
      const YArray = []
      let groupWidth = 0
      let groupHeight = 0
      let groupLeft = 0
      let groupTop = 0
      for (let item of nodes) {
        if (item.className !== undefined && item.className.includes(this.classNameActive)) {
          activeAll.push(item)
        }
      }
      const AllLength = activeAll.length
      if (AllLength > 1) {
        for (let i of activeAll) {
          const l = i.offsetLeft
          const r = l + i.offsetWidth
          const t = i.offsetTop
          const b = t + i.offsetHeight
          XArray.push(t, b)
          YArray.push(l, r)
        }//得到活动元素的边线范围
        groupWidth = Math.max(...YArray) - Math.min(...YArray)
        groupHeight = Math.max(...XArray) - Math.min(...XArray)
        groupLeft = Math.min(...YArray)
        groupTop = Math.min(...XArray)
      }
      const bln = AllLength === 1
      return { groupWidth, groupHeight, groupLeft, groupTop, bln }
    },
    // 正则获取left与top
    formatTransformVal (string) {
      let [left, top] = string.replace(/[^0-9\-\.,]/g, '').split(',')
      if (top === undefined) top = 0
      return [+left, +top]
    }
  },
  computed: {
    // nodes () {
    //   let nodes = this.$el.parentNode.childNodes
    //   nodes = Array.prototype.slice.call(nodes);
    //   nodes.push(this.$el.parentNode)
    //   return nodes;
    // },
    handleStyle () {
      return (stick) => {
        if (!this.handleInfo.switch) return { display: this.enabled ? 'block' : 'none' }

        const size = (this.handleInfo.size / this.scaleRatio).toFixed(2)
        const offset = (this.handleInfo.offset / this.scaleRatio).toFixed(2)
        const center = (size / 2).toFixed(2)

        const styleMap = {
          tl: {
            top: `${offset}px`,
            left: `${offset}px`
          },
          tm: {
            top: `${offset}px`,
            left: `calc(50% - ${center}px)`
          },
          tr: {
            top: `${offset}px`,
            right: `${offset}px`
          },
          mr: {
            top: `calc(50% - ${center}px)`,
            right: `${offset}px`
          },
          br: {
            bottom: `${offset}px`,
            right: `${offset}px`
          },
          bm: {
            bottom: `${offset}px`,
            right: `calc(50% - ${center}px)`
          },
          bl: {
            bottom: `${offset}px`,
            left: `${offset}px`
          },
          ml: {
            top: `calc(50% - ${center}px)`,
            left: `${offset}px`
          }
        }
        const stickStyle = {
          width: `${size}px`,
          height: `${size}px`,
          top: styleMap[stick].top,
          left: styleMap[stick].left,
          right: styleMap[stick].right,
          bottom: styleMap[stick].bottom
        }
        stickStyle.display = this.enabled ? 'block' : 'none'
        return stickStyle
      }
    },
    style () {
      return {
        transform: `translate(${this.left}px, ${this.top}px)`,
        width: this.computedWidth,
        height: this.computedHeight,
        zIndex: this.zIndex,
        ...(this.dragging && this.disableUserSelect ? userSelectNone : userSelectAuto)
      }
    },
    // 控制柄显示与否
    actualHandles () {
      if (!this.resizable) return []

      return this.handles
    },
    computedWidth () {
      if (this.w === 'auto') {
        if (!this.widthTouched) {
          return 'auto'
        }
      }
      return this.width + 'px'
    },
    computedHeight () {
      if (this.h === 'auto') {
        if (!this.heightTouched) {
          return 'auto'
        }
      }
      return this.height + 'px'
    },
    resizingOnX () {
      return (Boolean(this.handle) && (this.handle.includes('l') || this.handle.includes('r')))
    },
    resizingOnY () {
      return (Boolean(this.handle) && (this.handle.includes('t') || this.handle.includes('b')))
    },
    isCornerHandle () {
      return (Boolean(this.handle) && ['tl', 'tr', 'br', 'bl'].includes(this.handle))
    }
  },

  watch: {
    dragging (val) {
      if (val) {
        this.componentsXY();
      }
    },
    active (val) {
      this.enabled = val

      if (val) {
        this.$emit('activated')
      } else {
        this.$emit('deactivated')
      }
    },
    z (val) {
      if (val >= 0 || val === 'auto') {
        this.zIndex = val
      }
    },
    x (val) {
      if (this.resizing || this.dragging) {
        return
      }

      if (this.parent) {
        this.bounds = this.calcDragLimits()
      }

      this.moveHorizontally(val)
    },
    y (val) {
      if (this.resizing || this.dragging) {
        return
      }

      if (this.parent) {
        this.bounds = this.calcDragLimits()
      }

      this.moveVertically(val)
    },
    lockAspectRatio (val) {
      if (val) {
        this.aspectFactor = this.width / this.height
      } else {
        this.aspectFactor = undefined
      }
    },
    minWidth (val) {
      if (val > 0 && val <= this.width) {
        this.minW = val
      }
    },
    minHeight (val) {
      if (val > 0 && val <= this.height) {
        this.minH = val
      }
    },
    maxWidth (val) {
      this.maxW = val
    },
    maxHeight (val) {
      this.maxH = val
    },
    w (val) {
      if (this.resizing || this.dragging) {
        return
      }

      if (this.parent) {
        this.bounds = this.calcResizeLimits()
      }

      this.changeWidth(val)
    },
    h (val) {
      if (this.resizing || this.dragging) {
        return
      }

      if (this.parent) {
        this.bounds = this.calcResizeLimits()
      }

      this.changeHeight(val)
    }
  }
}
</script>
