<template>
  <div v-if="currPage!=null"
       :style="{width:currPage.style.width+'px',
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
  <!-- <div>hello</div> -->
</template>
<script>
import { getComponentStyle } from '@/utils/style'
import { events } from '@/utils/events'
import axios from 'axios'

export default {
  name: 'app',
  data () {
    return {
      currPage: null,
      pageList: null,
    }
  },
  mounted () {
    this.getData();
  },
  methods: {
    getData () {
      axios.get('./pages.json').then(response => {

        this.pageList = response.data;
        this.currPage = this.pageList[0];
        console.log(this.currPage);
      }, response => {
        console.log("error");
      });
    },
    getStyles (item) {
      console.log(item)
      return getComponentStyle(item);
    },
    handleClick (item) {
      Object.keys(item.events).forEach((event) => {
        let index = events[event](item.events[event]);
        if (index <= this.pageList.length) {
          this.currPage = this.pageList[index - 1]
        }
      })
    }
  }
}
</script>
<style>
#app {
  font-family: "Helvetica Neue", Helvetica, Arial, "PingFang SC",
    "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.preview-container {
  position: relative;
  top: 50px;
  margin: 20px auto;
  background-size: cover;
}

.editor-component {
  position: absolute;
  outline: none;
  width: 100%;
  height: 100%;
}
</style>

