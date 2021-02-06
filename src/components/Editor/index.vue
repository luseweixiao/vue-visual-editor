<template>
  <div id="editor"
       class="editor"
       v-if="editMode"
       style="height: 300px; width: 600px; position: relative;"
       @contextmenu="handleContextMenu">
    <!-- key不要用index，不然当调整图层时，焦点组件会变化（跟随渲染的index） -->
    <VueDraggableResizable v-for="(item,index) in pageList[currPageIndex].componentsData"
                           :key="item.id"
                           :w="item.style.width"
                           :h="item.style.height"
                           :x="item.style.left"
                           :y="item.style.top"
                           :z="index"
                           :parent="true"
                           :debug="false"
                           :isConflictCheck="false"
                           :snap="snap"
                           :snapTolerance="snapTolerance"
                           @refLineParams="getRefLineParams"
                           @activated="onActivated(item,index)"
                           @resizing="onResizing(arguments,item,index)"
                           @dragging="onDragging(arguments,item,index)"
                           @dragstop="onDragStop"
                           @deactivated="onDeactivated"
                           :draggable="!item.locked"
                           :resizable="!item.locked">

      <!-- <p>{{item.width}}-{{item.height}}</p> -->
      <component :is="item.component"
                 class="editor-component"
                 :style="getComponentStyle(item)"
                 :data-itemindex="index" />
      <ContextMenu v-if="item==currComponent&&editMode"
                   :isLocked="item.locked" />
    </VueDraggableResizable>
    <span class="ref-line v-line"
          v-for="(item,index) in vLine"
          :key="'v-'+index"
          v-show="item.display"
          :style="{ left: item.position, top: item.origin, height: item.lineLength}" />
    <span class="ref-line h-line"
          v-for="(item,index) in hLine"
          :key="'h-'+index"
          v-show="item.display"
          :style="{ top: item.position, left: item.origin, width: item.lineLength}" />

  </div>
</template>

<script>
import { mapState } from 'vuex'
import '@/components/Editor/vue-draggable-resizable.css'
import VueDraggableResizable from "@/components/Editor/vue-draggable-resizable"
import ContextMenu from "@/components/Editor/ContextMenu"

import getStyle from '@/utils/style'

export default {
  components: {
    VueDraggableResizable,
    ContextMenu,
  },
  data () {
    return {
      snap: true,
      snapTolerance: 10,
      vLine: [],
      hLine: [],
      menuTop: 0,
      menuLeft: 0,
    }
  },
  methods: {
    onDeactivated () {
      // this.$store.commit("changeCurrComponentIndex", -1)
      this.$store.commit("hideContextMenu")
    },
    onDragStop () {

    },

    //vals=[left,top,widht,height]
    onResizing (vals, item, index) {
      item.style.left = vals[0];
      item.style.top = vals[1];
      item.style.width = vals[2];
      item.style.height = vals[3];

      this.$store.commit("setCurrComponent", { component: item, index });
    },

    //vals=[left,top]
    onDragging (vals, item, index) {
      item.style.left = vals[0];
      item.style.top = vals[1];
      this.$store.commit("setCurrComponent", { component: item, index });
    },

    onActivated (item, index) {
      this.$store.commit("setCurrComponent", { component: item, index });
      this.$store.commit("hideContextMenu")
    },
    getComponentStyle (item) {
      return getStyle(item.style, ['top', 'left', 'width', 'height', 'rotate'])
    },

    getShapeStyle (style) {
      return getStyle(style, ['width', 'height', 'top', 'left', 'rotate'])
    },

    // 辅助线回调事件
    getRefLineParams (params) {
      const { vLine, hLine } = params
      let id = 0
      this.vLine = vLine.map(item => {
        item['id'] = ++id
        return item
      })
      this.hLine = hLine.map(item => {
        item['id'] = ++id
        return item
      })
    },
    handleContextMenu (e) {
      e.stopPropagation();
      e.preventDefault();
      if (Number(e.srcElement.dataset.itemindex) == this.currComponentIndex ||
        Number(e.target.parentNode.dataset.itemindex) == this.currComponentIndex) {
        this.$store.commit('showContextMenu')
      }
    }
  },
  computed: {
    ...mapState(["editorStyleData", "pageList", "currPageIndex", "editMode", "currComponent", "currComponentIndex", "preventDeactivation"]),
  }
}
</script>

<style scoped>
#editor {
  background-color: #fff;
  position: relative;
}
.editor-component {
  outline: none;
  width: 100%;
  height: 100%;
}
</style>
