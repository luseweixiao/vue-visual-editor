<template>
  <div class="preview-bg">
    <button class="preview-bg-btncloss"
            @click="close">关闭</button>
    <div :style="{width:page.style.width+'px',
       height:page.style.height+'px',
       backgroundColor:page.style.backgroundColor,
       backgroundImage:page.style.backgroundImage}"
         style=" box-shadow:0px 0px 2px 2px rgba(0,0,0,.2);"
         class="preview-container">
      <component v-for="(item,index) in page.componentsData"
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

export default {
  props: {
    page: {
      require: true,
      type: Object
    }
  },
  methods: {
    getStyles (item) {
      return getComponentStyle(item);
    },
    close () {
      console.log("closePreview")
      this.$emit("closePreview");
    },
    handleClick (item) {
      console.log(events["redirect"])
      Object.keys(item.events).forEach((event) => {
        // console.log(events[event], item.events)
        events[event](item.events[event])
      })
    }
  },
  computed: {
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
  z-index: 10;

  .preview-bg-btncloss {
    position: fixed;
    top: 0;
    right: 30px;
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
