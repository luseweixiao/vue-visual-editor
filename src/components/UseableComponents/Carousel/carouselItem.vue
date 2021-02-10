
<template>
  <div class="swiper-item"
       :style="{'-webkit-transform':imgLateX,height:imgH+'px',width:imgW+'px'}">
    <img :src="img" />
  </div>
</template>

<script>
export default {

  name: 'swiper-item',
  props: {
    img: {
      type: String,
    },
    imgWidth: {
      type: Number,
      require: true
    },
    imgW: {
      type: Number,
      require: true
    },
    imgH: {
      type: Number,
      require: true
    },
    imgHeight: {
      require: true,
      type: Number
    }
  },
  data () {
    return {
      imgUrl: `url(` + this.img + ')'
    }
  },
  computed: {
    imgLateX () {
      return 'translate3d(' + (this.imgWidth) + 'px,0,0)'
    }
  }
}
</script>

<style lang="css">
.swiper-item {
  position: absolute;
  top: 0;
  left: 0;
}
.swiper-item img {
  width: 100%;
  height: 100%;
}
</style>
