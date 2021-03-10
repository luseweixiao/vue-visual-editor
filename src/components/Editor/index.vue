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
       @click="handleEditorClick"
       @contextmenu.prevent>

    <!-- key不要用index，不然当调整图层时（图层与index一致），焦点组件会变化 -->
    <VueDraggableResizable v-for="(item,index) in pageList[currPageIndex].componentsData"
                           :key="item.id"
                           :w="Number(item.style.width)"
                           :h="Number(item.style.height)"
                           :x="Number(item.style.left)"
                           :y="Number(item.style.top)"
                           :z="index==currComponentIndex?888:index"
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
                           :resizable="!item.locked"
                           @contextmenu.native="handleContextMenu(arguments,item,index)"
                           :active="index==currComponentIndex">
      <!-- 组件 -->
      <component :is="item.component"
                 class="editor-component"
                 :style="getStyle(item)"
                 :data-itemindex="index"
                 :propvalue="item.propValue"
                 v-on:textChange="onTextChange(arguments,index)"
                 :element="item" />
      <!-- 右键菜单 -->

    </VueDraggableResizable>
    <ContextMenu :isShow="menuShow"
                 :isLocked="isLocked"
                 :style="{left:menuLeft,top:menuTop}"
                 style="position:absolute;z-index:900;"
                 @close="handleClose" />
    <!-- 对齐线 -->
    <span class="ref-line v-line"
          v-for="(item,index) in vLine"
          :key="'v-'+index"
          :style="{ left: item.position}"
          v-show="item.display"
          style="top:0;bottom:0;" />
    <span class="ref-line h-line"
          v-for="(item,index) in hLine"
          :key="'h-'+index"
          :style="{ top: item.position}"
          v-show="item.display"
          style="left:0;right:0;" />
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
      isParent: true,//是否进行父元素区域限制
      currItem: null,
      isLocked: false,
    }
  },
  methods: {
    getStyle (item) {
      return getComponentStyle(item);
    },
    onTextChange (val, index) {
      return debounce(function () {
        // console.log("onTextChange", val)
        let currComponent = val[0];
        currComponent.propValue = val[1];

        this.$store.commit("setCurrComponent", { component: currComponent, index })
      }, 500)
    },

    onDeactivated () {
    },

    onDragStop () {
      this.isParent = true;
    },
    //vals=[left,top,widht,height]
    onResizing (vals, item, index) {
      if (this.menuShow) {
        this.$store.commit("changeMenuShow", false);
      }

      item.style.left = vals[0];
      item.style.top = vals[1];
      item.style.width = vals[2];
      item.style.height = vals[3];

      this.$store.commit("setCurrComponent", { component: item, index });


    },

    //vals=[left,top]
    onDragging (vals, item, index) {
      if (this.menuShow) {
        this.$store.commit("changeMenuShow", false);
      }

      this.isParent = true;

      item.style.left = vals[0];
      item.style.top = vals[1];
      this.$store.commit("setCurrComponent", { component: item, index });
      // eventBus.$emit("move", item);


    },

    onActivated (item, index) {
      this.currItem = item;
      this.$store.commit("setCurrComponent", { component: item, index });
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

    handleContextMenu (val, item, index) {
      let e = val[0];
      e.stopPropagation();
      e.preventDefault();

      this.$store.commit("setCurrComponent", { component: item, index });
      this.menuTop = e.offsetY + item.style.top + 'px';
      this.menuLeft = e.offsetX + item.style.left + 'px';
      this.isLocked = item.locked;
      this.$store.commit("changeMenuShow", true);
    },
    handleClose () {
      this.$store.commit("changeMenuShow", false);
    },

    findParentNodeByClassName (el, classname) {
      let node = el;
      do {
        if (node.classList && node.classList.contains(classname)) return node;
        node = node.parentNode;
      } while (node)
      return null
    },
    handleEditorClick (e) {
      console.log("handleEditorClick", this.currComponentIndex)
      if (e.target && e.target.id == "editor") {
        this.$store.commit("changeCurrComponentIndex", -1);
        this.$store.commit("changeMenuShow", false);
      }
    },

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
.outline {
  outline: #00ff00 dotted thick;
}
</style>
