<template>
  <div class="jsontext">
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
  width: 100%;
  padding-top: 10px;
  height: 150px;
  z-index: 100;
  box-sizing: border-box;

  .jsontext-header {
    width: 100%;
    height: 20px;
    position: relative;
    background-color: antiquewhite;

    .close {
      width: 20px;
      height: 20px;
      position: absolute;
      top: 0;
      right: 0;
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
