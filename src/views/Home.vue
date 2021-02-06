<template>
  <div class="home">
    <!-- 左侧页面管理与组件管理 -->
    <section class="home-left">
      <a :class="{isactive:activeManagePageName=='page-tags'}"
         @click="showPageTags">页面管理</a>
      <a :class="{isactive:activeManagePageName=='component-list'}"
         @click="showComponentList">组件列表</a>
      <component :is="activeManagePageName"
                 class="home-left-controlplane"></component>
    </section>

    <!--中间编辑区、预览、文本  -->
    <section class="home-center">
      <div class="home-center-header"> <span>编辑区</span><span v-show="editMode"
              style="margin-left:5px;color:rgb(22, 155, 213);">页面{{currPageIndex+1}}</span></div>
      <div class="home-center-editor"
           @drop="handleDrop"
           @dragover="handleDragOver"
           @click="deselectCurComponent">
        <Editor v-if="currPageIndex!=-1&&editMode" />
      </div>

      <!-- <button @click="showPreview"
              class="btn-preview"> 预览</button><br />
      <div class="previewPlane">预览区</div>
      <textarea /> -->
    </section>

    <!-- 右侧属性面板 -->
    <section class="home-right">
      <a>属性</a>
      <attribute-list />
      <!-- <el-tabs v-model="activeToolboxName">
        <el-tab-pane label="属性"
                     name="propertiesPlane">
          <AttributeList />
        </el-tab-pane>
      </el-tabs> -->
    </section>
  </div>
</template>

<script>
import Editor from '@/components/Editor/index'
import PageTags from '@/components/PageTags'
import ComponentList from '@/components/ComponentList'
import AttributeList from "@/components/AttributeList"
import { mapState } from 'vuex'
import componentslist from '@/components/UseableComponents/components-list'
import generateID from '@/utils/generateID'
import { deepCopy } from '@/utils/utils'

export default {
  name: 'Home',
  components: {
    Editor,
    PageTags,
    ComponentList,
    AttributeList

  },
  data () {
    return {
      activeManagePageName: 'page-tags',
      activeToolboxName: 'propertiesPlane',
    }
  },
  methods: {
    showPageTags () {
      this.activeManagePageName = "page-tags";
    },
    showComponentList () {
      this.activeManagePageName = "component-list";
    },
    handleClick () {
      console.log('management-change')
    },
    showPreview () {
      console.log('prevew')
    },
    handleDrop (e) {
      e.preventDefault()
      e.stopPropagation()
      const component = deepCopy(componentslist[e.dataTransfer.getData('index')])
      //e.target为editor
      component.style.top = e.offsetY
      component.style.left = e.offsetX
      component.id = generateID()
      this.$store.commit('addComponentToCurrPage',
        component
      )
      // this.$store.commit('recordSnapshot')
    },
    handleDragOver (e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    deselectCurComponent () {
      // this.$store.commit('changeCurrComponentIndex', -1)
      // this.$store.commit('hideContexeMenu')
    },
  },
  computed: {
    ...mapState(["currPageIndex", "editMode"])
  }
}
</script>

<style lang="scss" >
$homePadding: 5px; //主页面与浏览器距离
$headerHeight: 40px; //左中右栏的header高度
$leftWidth: 182px; //右侧栏宽度
$rightWidth: 162px; //右侧栏宽度
$bd: 2px solid #e4e7ed;
$bdColor: #e4e7ed; //边框颜色
$bdWidth: 2px; //边框宽度
$bgColor: rgba(215, 215, 215, 1); //左右面板背景颜色
$fontColor: #303133; //字体颜色
$iconColor: blue; //图标颜色
$boxShadowColor: rgba(0, 0, 0, 0.3); //阴影颜色
/* 整体Layout */

.home {
  position: fixed;
  top: $homePadding;
  right: $homePadding;
  bottom: $homePadding;
  left: $homePadding;
  background: gray;
  box-shadow: 0px 0px 2px 3px $boxShadowColor;
  font-size: 14px;
  font-weight: 500;
  color: $fontColor;
  height: calc(100% - #{$homePadding * 2});

  & > .home-left {
    width: $leftWidth;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: $bgColor;
    border-right: $bd;
    height: 100%;

    & > a {
      display: inline-block;
      width: 50%;
      height: $headerHeight;
      text-align: center;
      line-height: $headerHeight;
      box-sizing: border-box;
      cursor: pointer;
      border-bottom: $bd;
    }
    & > a.isactive {
      color: $iconColor;
    }
    & > a:nth-child(1) {
      border-right: $bd;
    }
    & > .home-left-controlplane {
      height: calc(100% - #{$headerHeight});
      padding-bottom: 50px;
      overflow-y: auto;
    }
  }

  & > .home-center {
    position: absolute;
    left: $leftWidth;
    right: $rightWidth;
    top: 0;
    bottom: 0;
    background-color: $bgColor;

    & > .home-center-header {
      height: $headerHeight;
      border-bottom: $bd;
      line-height: $headerHeight;
      background-color: $bgColor;
    }
  }
  & > .home-right {
    position: absolute;
    width: $rightWidth;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: $bgColor;
    border-left: $bd;

    & > a {
      display: inline-block;
      width: 100%;
      height: $headerHeight;
      text-align: left;
      padding-left: 20px;
      line-height: $headerHeight;
      box-sizing: border-box;
      cursor: pointer;
      border-bottom: $bd;
    }
  }
}
</style>
