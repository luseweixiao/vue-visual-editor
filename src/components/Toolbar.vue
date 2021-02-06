<template>
  <ul class="toolbar">
    <li @click="addPage">新增</li>
    <li @click="copyPage">复制</li>
    <li @click="deletePage">删除</li>
  </ul>
</template>

<script>
import Page from '@/components/Page'

export default {
  methods: {
    addPage () {
      console.log("add")
      var index = this.pageList.length + 1;
      var page = new Page("页面" + index, index - 1, []);
      this.$store.commit("addPage", page);
      // this.$emit("addPage");
    },
    copyPage () {
      console.log("copy")
    },
    deletePage () {
      console.log("delete")
    },
  }
}
</script>

<style scope>
.toolbar {
  /* display: none; */
  position: absolute;
  top: 20px;
  right: 0px;
  z-index: 1000;
}
.toolbar ul {
  list-style: none;
  font-weight: 400;
  font-size: 12px;
  background-color: rgba(215, 215, 215, 1);
  border: 1px solid rgba(121, 121, 121, 1);
}
.toolbar ul li:hover {
  background-color: antiquewhite;
  cursor: pointer;
}
</style>