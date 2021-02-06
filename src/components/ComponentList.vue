<template>
  <div @dragstart="handleDragStart"
       class="componentlist">
    <div v-for="(item,index) in componentslist"
         :key="index"
         class="list"
         :data-index="index"
         draggable>
      <i :class="item.icon"></i>
      <span>{{item.label}}</span>
    </div>
  </div>
</template>

<script>
import componentslist from '@/components/UseableComponents/components-list'
export default {
  data () {
    return {
      componentslist
    }
  },
  methods: {
    handleDragStart (e) {
      // console.log(e.target.dataset.index)
      e.dataTransfer.setData('index', e.target.dataset.index);
    }
  }
}
</script>

<style scope>
.componentlist {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  align-content: flex-start;
  padding: 10px;
}
.componentlist .list {
  width: 60px;
  height: 30px;
  line-height: 30px;
  margin: 5px;
  padding: 2px;
  cursor: grab;
  text-align: center;
  background-color: rgb(164, 206, 226);
  box-shadow: 2px 3px 3px rgba(0, 0, 0, 0.329);
  font-size: 14px;
  font-weight: 400;
}
.componentlist .list:hover {
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.329);
}
.componentlist .list:active {
  cursor: grabbing;
  box-shadow: 2px 1px 3px rgba(0, 0, 0, 0.329);
}
</style>
