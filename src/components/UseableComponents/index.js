import Vue from 'vue'

const components = [
  "UPicture",
  "UButton",
  "UText",
];

//注册可用的组件
components.forEach(key => {
  Vue.component(key, () => import(`@/components/UseableComponents/${key}`));
})