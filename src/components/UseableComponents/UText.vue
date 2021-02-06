<template>
  <textarea @input="handleInput" />
</template>

<script>
export default {
  name: "u-text",
  props: {
    propValue: {
      type: String,
    },
    element: {
      type: Object,
    }
  },
  methods: {
    handleInput (e) {
      this.$emit("input", this.element, e.target.value);
    }
  }
}
</script>
<style scoped>
textarea {
  resize: none;
}
</style>