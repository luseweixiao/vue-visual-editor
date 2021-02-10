<template>
  <!-- <textarea @input="handleInput"
            v-bind:value="propvalue" /> -->
  <div class="utext">
    <pre class="utext-text">{{propvalue}}</pre>
  </div>
</template>

<script>
export default {
  name: "u-text",
  props: {
    propvalue: {
      require: true,
      type: String,
    },
    element: {
      type: Object,
    }
  },
  data () {
    return {
      // textValue: this.propvalue
    }
  },
  methods: {
    // handleInput (e) {
    //   // this.textValue = e.target.value;
    //   this.$emit("textChange", this.element, e.target.value);
    // }
  },
  computed: {
  }
}
</script>
<style lang="scss" scoped>
/* textarea {
  resize: none;
  box-sizing: border-box;
  overflow: hidden;
} */
.utext {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;

  & > .utext-text {
    margin: 0;
    padding: 0;
    width: 100%;
    word-break: break-all;
    word-wrap: break-word;
  }
}
</style>
