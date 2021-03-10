<template>
  <div class="home">
    <!----- 左侧页面管理与组件管理 ---------------->
    <section class="home-left">
      <a :class="{isactive:activeManagePageName=='page-tags'}"
         @click="changeActiveManagePageName">页面管理</a>
      <a :class="{isactive:activeManagePageName=='component-list'}"
         @click="changeActiveManagePageName">组件列表</a>
      <component :is="activeManagePageName"
                 class="home-left-controlplane"></component>
    </section>

    <!-------中间编辑区、预览、文本  -------------->
    <section class="home-center">
      <div class="home-center-header">
        <span>编辑区</span><span v-show="editMode"
              style="margin-left:5px;color:rgb(22, 155, 213);">页面{{currPageIndex+1}}</span>

        <!----------- 画布尺寸----------------- -->
        <div v-if="currPageIndex>=0"
             style="display:inline-block;margin-left:40px;">
          <span>画布：</span>
          <!-- <input type="number"
                 @change="changePageStyle('width',$event)"
                 v-bind:value="pageList[currPageIndex].style.width"
                 style="width:70px;"
                 :disabled="pageList[currPageIndex].componentsData.length>0" /> -->
          <input type="number"
                 v-model="pageWidth"
                 style="width:70px;"
                 :disabled="pageList[currPageIndex].componentsData.length>0"
                 min=1 />
          <span>×</span>
          <!-- <input type="number"
                 @change="changePageStyle('height',$event)"
                 v-bind:value="pageList[currPageIndex].style.height"
                 style="width:70px;"
                 :disabled="pageList[currPageIndex].componentsData.length>0" /> -->
          <input type="number"
                 v-model="pageHeight"
                 style="width:70px;"
                 :disabled="pageList[currPageIndex].componentsData.length>0"
                 min=1 />
        </div>

        <!-- ----------预览------------------ -->
        <button @click="showPreview"
                class="home-center-header-preview"> 预览</button>
        <button @click="showJson"
                class="home-center-header-json"> JSON</button>
        <!-- <div class="previewPlane">预览区</div> -->
        <preview v-if="isPreview"
                 v-on:closePreview="isPreview=false"
                 :page="pageList[currPageIndex]" />
        <JsonText v-if="pageList.length>0 && currPageIndex>-1&&isShowJson"
                  :page="pageList[currPageIndex]"
                  v-on:close="handleCloseJson" />
      </div>
      <!---------------画布------------------- -->
      <div class="home-center-editor"
           @drop="handleDrop"
           @dragover="handleDragOver"
           @click="deselectCurComponent">
        <Editor v-if="currPageIndex!=-1 && editMode" />
      </div>

    </section>

    <!------ 右侧属性面板 ------------------------->
    <section class="home-right">
      <!-- <a>属性</a>
      <attribute-list /> -->
      <a :class="{isactive:rightPlaneName=='attribute-list'}"
         @click="changeRightPlane">属性</a>
      <a :class="{isactive:rightPlaneName=='event-list'}"
         @click="changeRightPlane">事件</a>
      <component :is="rightPlaneName"></component>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Editor from '@/components/Editor/index'
import PageTags from '@/components/LeftPlane/PageTags'
import ComponentList from '@/components/LeftPlane/ComponentList'
import AttributeList from "@/components/RightPlane/AttributeList"
import EventList from "@/components/RightPlane/EventList"
import componentslist from '@/components/UseableComponents/components-list'
import Preview from '@/components/Preview'
import JsonText from "@/components/JsonText"
import generateID from '@/utils/generateID'
import { deepCopy } from '@/utils/utils'

export default {
  name: 'Home',
  components: {
    Editor,
    PageTags,
    ComponentList,
    AttributeList,
    EventList,
    Preview,
    JsonText

  },
  data () {
    return {
      activeManagePageName: 'page-tags',
      activeToolboxName: 'propertiesPlane',
      isPreview: false,
      rightPlaneName: 'attribute-list',
      isShowJson: false
    }
  },
  methods: {
    changeActiveManagePageName () {
      if (this.activeManagePageName == 'page-tags') {
        this.activeManagePageName = 'component-list';
      } else {
        this.activeManagePageName = 'page-tags';
      }
    },
    changeRightPlane () {
      if (this.rightPlaneName == 'attribute-list') {
        return this.rightPlaneName = 'event-list';
      } else {
        this.rightPlaneName = 'attribute-list';
      }
    },
    showPreview () {
      if (this.editMode) this.isPreview = true;
      this.isShowJson = false;
    },
    showJson () {
      this.isShowJson = true;
    },
    handleCloseJson () {
      this.isShowJson = false;
    },
    handleDrop (e) {
      e.preventDefault();
      e.stopPropagation();
      const component = deepCopy(componentslist[e.dataTransfer.getData('index')]);
      //e.target为editor
      component.style.top = e.offsetY;
      component.style.left = e.offsetX;
      component.id = generateID();
      this.$store.commit('addComponentToCurrPage',
        component
      );

    },

    handleDragOver (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    },

    deselectCurComponent () {
      //bug
      // this.$store.commit('changeCurrComponentIndex', -1)
      // this.$store.commit('hideContexeMenu')
    },
    changePageStyle (type, e) {
      var style = this.pageList[this.currPageIndex].style;
      console.log(type, e.target.value);
      style[type] = Number(e.target.value);
      this.$store.commit('changePageStyle', style);
    },
  },
  computed: {
    ...mapState(["currPageIndex", "editMode", "pageList", "currComponent", "menuShow"]),

    pageWidth: {
      set (value) {
        var style = this.pageList[this.currPageIndex].style;
        // console.log(type,value);
        style['width'] = Number(value);
        this.$store.commit('changePageStyle', style);
      },
      get () {
        return this.pageList[this.currPageIndex].style.width;
      }
    },

    pageHeight: {
      set (value) {
        var style = this.pageList[this.currPageIndex].style;
        // console.log(type,value);
        style['height'] = Number(value);
        this.$store.commit('changePageStyle', style);
      },
      get () {
        return this.pageList[this.currPageIndex].style.height;
      }
    }
  }
}
</script>

<style lang="scss" >
$homePadding: 5px; //主页面与浏览器距离
$headerHeight: 40px; //左中右栏的header高度
$leftWidth: 182px; //右侧栏宽度
$rightWidth: 182px; //右侧栏宽度
$bd: 2px solid #e4e7ed;
$bdColor: #bdc3c7; //边框颜色
$bdWidth: 2px; //边框宽度
$bgColor: rgba(215, 215, 215, 1); //左右面板背景颜色
$fontColor: #303133; //字体颜色
$iconColor: #2980b9; //图标颜色
$boxShadowColor: rgba(0, 0, 0, 0.3); //阴影颜色
$bottomHeight: 150px; //jsontext高度
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

    & > .home-left-controlplane {
      height: calc(100% - #{$headerHeight});
      padding-bottom: 50px;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  .home-left,
  .home-right {
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
  }
  & > .home-center {
    position: absolute;
    left: $leftWidth;
    right: $rightWidth;
    top: 0;
    bottom: 0;
    background-color: #ecf0f1;

    & > .home-center-header {
      height: $headerHeight;
      border-bottom: $bd;
      line-height: $headerHeight;
      background-color: $bgColor;
      z-index: 100;

      button.home-center-header-preview,
      button.home-center-header-json {
        margin-left: 100px;
        width: 70px;
        height: 30px;
        border-radius: 10px;
        cursor: pointer;
        outline: none;
        box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.3);

        &:hover {
          background-color: $iconColor;
        }

        &:active {
          box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
        }
      }
    }
    & > .home-center-editor {
      max-width: 100%;
      max-height: calc(100% - #{$headerHeight});
      overflow: auto;
      // padding: 0 20px 0 20px;
      padding: 10px;
      z-index: 99;
    }
  }
  & > .home-right {
    position: absolute;
    width: $rightWidth;
    height: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: $bgColor;
    border-left: $bd;

    & > .attribuite-list {
      height: calc(100% - #{$headerHeight});
      padding-bottom: 50px;
    }
  }
}
</style>
