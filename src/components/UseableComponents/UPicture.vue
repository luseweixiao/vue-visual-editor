<template>
  <div>
    <Carousel v-if="element.images.length>0"
              :imgWidth="element.style.width"
              :imgHeight="element.style.height"
              :imgList="element.images"
              :initIndex="0"
              :loop="true"
              :auto="element.auto"
              :autoTime="element.autoTime*1000" />
    <img v-else
         src="@/assets/edit.png"
         alt="">
  </div>
</template>

<script>
import Carousel from "./Carousel"
export default {
  name: "u-picture",
  components: {
    Carousel
  },
  props: {
    propvalue: {
      require: true,
      type: String,
    },
    element: {
      type: Object,
    }
  }
}
</script>

<style scoped>
img {
  width: 100%;
  height: 100%;
}
</style>
