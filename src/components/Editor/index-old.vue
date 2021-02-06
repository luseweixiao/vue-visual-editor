<template>
  <div id="editor"
       v-if="editMode"
       :style="{
    width:editorStyleData.width+'px',
    height:editorStyleData.height+'px'
    }"
       @mousedown.prevent.stop="">
    <DraggableContainer v-for="(item,index) in pageList[currPageIndex].componentsData"
                        :key="index"
                        :defaultStyle=item.style
                        :style="getShapeStyle(item.style)"
                        :index="index"
                        :active="item==currComponent"
                        :element="item">
      <component :is="item.component"
                 class="editor-component"
                 :style="getComponentStyle(item)" />
    </DraggableContainer>
    <MarkLine />
  </div>
</template>

<script>
import DraggableContainer from '@/components/Editor/DraggableContainer'
import MarkLine from '@/components/Editor/MarkLine'
import { mapState } from 'vuex'
import getStyle from '@/utils/style'

export default {
  components: {
    DraggableContainer,
    MarkLine
  },
  data () {
    return {
    }
  },
  methods: {
    getComponentStyle (item) {
      return getStyle(item.style, ['top', 'left', 'width', 'height', 'rotate'])
    },
    handleContextMenu () {
    },
    getShapeStyle (style) {
      return getStyle(style, ['width', 'height', 'top', 'left', 'rotate'])
    },
  },
  computed: {
    ...mapState(["pageList", "editorStyleData", "currPageIndex", "editMode", "currComponentIndex", "currComponent"]),
    // currComponent () {
    //   var currCom = (this.pageList.length > 0 && this.pageList[this.currPageIndex] != null) ? this.pageList[this.currPageIndex].componentsData[this.currComponentIndex] : null;
    //   console.log("currCom", currCom)
    //   return currCom;
    // },
  },
}
</script>

<style scoped>
#editor {
  background-color: antiquewhite;
  width: 100%;
  height: 200px;
  position: relative;
}
.editor-component {
  outline: none;
  width: 100%;
  height: 100%;
}
</style>