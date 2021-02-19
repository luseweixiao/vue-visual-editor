<template>
  <div class="jsontext">
    <div class="jsontext-header">
      <i class="iconfont iconcha close"
         @click="close"></i>
    </div>
    <textarea class="jsontext-content"
              v-bind:value="json"
              @change="setPage($event)">

    </textarea>
  </div>
</template>

<script>
export default {
  props: {
    page: {
      require: true,
      type: Object
    }
  },
  methods: {
    setPage (e) {
      let page = JSON.parse(e.target.value);
      this.$store.commit("setPageList", page);
    },
    close () {
      this.$emit("close")
    }
  },
  computed: {
    json () {
      return JSON.stringify(this.page);
    }
  }
}
</script>
<style lang="scss" scoped>
.jsontext {
  width: 40%;
  padding-top: 10px;
  height: 150px;
  z-index: 100;
  box-sizing: border-box;
  top: 50px;
  left: 50%;
  position: fixed;

  .jsontext-header {
    width: 100%;
    height: 20px;
    position: relative;
    background-color: rgba(215, 215, 215, 1);

    .close {
      width: 20px;
      height: 20px;
      line-height: 20px;
      position: absolute;
      top: 0px;
      right: 0;
      color: red;
    }
  }
  .jsontext-content {
    width: 100%;
    height: 140px;
    border: none;
    outline: none;
    resize: none;
  }
}
</style>
