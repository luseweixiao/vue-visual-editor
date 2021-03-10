<template>
  <div class="preview-bg">
    <button class="preview-bg-btn save"
            @click="save">保存</button>
    <button class="preview-bg-btn closs"
            @click="close">关闭</button>

    <div :style="{width:currPage.style.width+'px',
       height:currPage.style.height+'px',
       background:currPage.style.background,
       backgroundColor:currPage.style.backgroundColor,
       backgroundImage:currPage.style.backgroundImage,
       }"
         style=" box-shadow:0px 0px 2px 2px rgba(0,0,0,.2);"
         class="preview-container"
         ref="previewContainer">
      <component v-for="(item,index) in currPage.componentsData"
                 :key="item.id"
                 :is="item.component"
                 class="editor-component"
                 :style="getStyles(item)"
                 :data-itemindex="index"
                 :propvalue="item.propValue"
                 :element="item"
                 @click.native="handleClick(item);return false;" />
    </div>
  </div>
</template>

<script>
import { getComponentStyle } from '@/utils/style'
import { events } from '@/utils/events'
import { mapState } from 'vuex';
import FileSaver from 'file-saver'

export default {
  props: {
    page: {
      require: true,
      type: Object
    }
  },
  data () {
    return {
      currPage: this.page
    }
  },
  methods: {
    save () {
      console.log("save")
      // console.log("save", this.$refs.previewContainer)
      //将pageList生成json
      let pagesJson = JSON.stringify(this.pageList);
      //可以读取模板文件将json插入作为数据
      const blob = new Blob([pagesJson], { type: '' })
      FileSaver.saveAs(blob, 'pages.json')
    },
    getStyles (item) {
      return getComponentStyle(item);
    },
    close () {
      this.$emit("closePreview");
    },
    handleClick (item) {
      Object.keys(item.events).forEach((event) => {
        let index = events[event](item.events[event]);
        if (index <= this.pageList.length) {
          this.currPage = this.pageList[index - 1]
        }
      })
    }
  },
  computed: {
    ...mapState(["pageList"]),
  }
}
</script>

<style lang="scss" scoped>
.preview-bg {
  width: 100%;
  height: 100%;
  overflow: auto;
  top: 0;
  left: 0;
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  .preview-bg-btn {
    position: fixed;
    top: 0;
    width: 80px;
    height: 40px;
    z-index: 20;
    background-color: #2980b9;
    color: #fff;
    border-radius: 15px;
    font-size: 18px;
    outline: none;
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5);
    cursor: pointer;

    &:active {
      box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
    }
  }
  .save {
    right: 130px;
  }

  .closs {
    right: 30px;
  }

  .preview-container {
    position: relative;
    top: 50px;
    margin: 20px auto;
    background-size: cover;

    .editor-component {
      position: absolute;
      outline: none;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
