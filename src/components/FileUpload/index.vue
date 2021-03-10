<template>
  <div class="container">
    <input type="file"
           style="display:none;"
           ref=fileInput
           @change="upload($event)">
    <button @click="getFile">{{label}}</button>
    <p>{{filename}}</p>
  </div>
</template>
<script>
export default {
  props: {
    accept: {//接受的类型
      require: true,
      type: string,
      validator () {
        return true;
      }
    },
    label: {//按钮显示文本
      require: true,
      default: "上传文件"
    }
  },
  data () {
    return {
      filename: "",//显示的文件名
    }
  },
  methods: {
    getFile () {
      this.$refs.fileInput.click();
    }
  }
}
</script>
