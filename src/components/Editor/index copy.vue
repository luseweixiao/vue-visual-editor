<template>
  <div id="editor"
       class="editor"
       v-if="editMode"
       :style="{
       width:pageList[currPageIndex].style.width+'px',
       height:pageList[currPageIndex].style.height+'px',
       backgroundColor:pageList[currPageIndex].style.backgroundColor,
       backgroundImage:pageList[currPageIndex].style.backgroundImage}"
       style=" box-shadow:0px 0px 2px 2px rgba(0,0,0,.2);"
       @contextmenu="handleContextMenu">

    <!-- key不要用index，不然当调整图层时（图层与index一致），焦点组件会变化 -->
    <VueDraggableResizable v-for="(item,index) in pageList[currPageIndex].componentsData"
                           :key="item.id"
                           :w="Number(item.style.width)"
                           :h="Number(item.style.height)"
                           :x="Number(item.style.left)"
                           :y="Number(item.style.top)"
                           :z="index"
                           :parent="isParent"
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
      <!-- 组件 -->
      <component :is="item.component"
                 class="editor-component"
                 :style="getStyle(item)"
                 :data-itemindex="index"
                 :propvalue="item.propValue"
                 v-on:textChange="onTextChange(arguments,index)" />
      <!-- 右键菜单 -->
      <ContextMenu v-if="item==currComponent&&menuShow"
                   :isLocked="item.locked" />
    </VueDraggableResizable>

    <!-- 对齐线 -->
    <!-- <span class="ref-line v-line"
          v-for="(item,index) in vLine"
          :key="'v-'+index"
          v-show="item.display"
          :style="{ left: item.position, top: item.origin, height: item.lineLength}" />
    <span class="ref-line h-line"
          v-for="(item,index) in hLine"
          :key="'h-'+index"
          v-show="item.display"
          :style="{ top: item.position, left: item.origin, width: item.lineLength}" /> -->
    <span class="ref-line v-line"
          v-for="(item,index) in vLine"
          :key="'v-'+index"
          v-show="item.display"
          :style="{ left: item.position}"
          style="top:0;bottom:0;" />
    <span class="ref-line h-line"
          v-for="(item,index) in hLine"
          :key="'h-'+index"
          v-show="item.display"
          :style="{ top: item.position}"
          style="left:0;right:0;" />
    <MarkLines v-if="currComponentIndex!=-1"
               v-on:changeStyle="handleChangeStyle" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import '@/components/Editor/vue-draggable-resizable.css'
import VueDraggableResizable from "@/components/Editor/vue-draggable-resizable"
import ContextMenu from "@/components/Editor/ContextMenu"
import { getComponentStyle } from '@/utils/style'
import { debounce } from "lodash";
import MarkLines from "@/components/Editor/MarkLines"
import eventBus from '@/utils/eventBus'

export default {
  components: {
    VueDraggableResizable,
    ContextMenu,
    MarkLines
  },
  data () {
    return {
      vLine: [],
      hLine: [],
      menuTop: 0,
      menuLeft: 0,
      isParent: true,//是否进行父元素区域限制，只在拖拽时开启
      currItem: null
    }
  },
  methods: {
    getStyle (item) {
      return getComponentStyle(item);
    },
    onTextChange (val, index) {
      return debounce(function (val, index) {
        // console.log("onTextChange", val)
        let currComponent = val[0];
        currComponent.propValue = val[1];

        this.$store.commit("setCurrComponent", { component: currComponent, index })
      }, 500)
    },

    onDeactivated () {
      this.$store.commit("hideContextMenu")
    },

    onDragStop () {
      this.isParent = true;
    },
    handleChangeStyle (item) {
      // console.log("handleChangeStyle", vals, this.currItem)
      // this.currItem.style.left = vals[0];
      // this.currItem.style.top = vals[1];
      // this.currItem.style.width = vals[2];
      // this.currItem.style.height = vals[3];
      this.$store.commit("setCurrComponent", { component: item, index: this.currComponentIndex });
    },
    //vals=[left,top,widht,height]
    onResizing (vals, item, index) {
      this.$nextTick(function () {
        item.style.left = vals[0];
        item.style.top = vals[1];
        item.style.width = vals[2];
        item.style.height = vals[3];

        this.$store.commit("setCurrComponent", { component: item, index });
      })

    },

    //vals=[left,top]
    onDragging (vals, item, index) {


      this.isParent = true;

      item.style.left = vals[0];
      item.style.top = vals[1];
      this.$store.commit("setCurrComponent", { component: item, index });
      eventBus.$emit("move", item);


    },

    onActivated (item, index) {
      this.currItem = item;
      this.$store.commit("setCurrComponent", { component: item, index });
      this.$store.commit("hideContextMenu")
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
      let target = this.findParentNodeByClassName(e.target, 'editor-component');
      if (target && Number(target.dataset.itemindex) == this.currComponentIndex) {
        this.$store.commit('showContextMenu');
      }
    },

    findParentNodeByClassName (el, classname) {
      let node = el;
      do {
        if (node.classList && node.classList.contains(classname)) return node;
        node = node.parentNode;
      } while (node)
      return null
    }

  },
  computed: {
    ...mapState(["pageList", "currPageIndex", "editMode", "currComponent", "currComponentIndex", "preventDeactivation", "menuShow", "snap", "snapTolerance"]),
  },
}
</script>

<style scoped>
#editor {
  position: relative;
  background-size: cover;
}
.editor-component {
  outline: none;
  width: 100%;
  height: 100%;
}
</style>
