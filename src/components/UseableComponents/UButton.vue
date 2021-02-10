<template>
  <!-- <div><button class="u-button">Text</button></div> -->
  <div class="u-button">
    <p>
    <pre>{{propvalue}}</pre>
    </p>
  </div>
</template>

<script>
export default {
  name: "u-button",
  props: {
    propvalue: {
      type: String,
    },
    element: {
      type: Object,
    }
  },
}
</script>

<style scope>
.u-button {
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
p {
  display: block;
  width: 100%;
  /* height: 100%; */
  color: inherit;
  outline: none;
  box-sizing: border-box;
  overflow: hidden;
  text-decoration: none;
}

.u-button:hover {
  cursor: pointer;
  text-decoration: none;
}
</style>
