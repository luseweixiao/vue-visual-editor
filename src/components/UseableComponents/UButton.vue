<template>
  <div><button class="u-button">Text</button></div>
</template>

<script>
export default {
  name: "u-button",
  props: {
    propValue: {
      type: String,
    },
    element: {
      type: Object,
    }
  },

}
</script>

<style scope>
button.u-button {
  width: 100%;
  height: 100%;
  /* border: none; */
  outline: none;
  box-sizing: border-box;
}
</style>