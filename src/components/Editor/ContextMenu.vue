<template>
  <div class="contextmenu"
       :class="{block:show,none:!show}">
    <ul @click="handleMenu">
      <li data-item="deleteComponent">删除</li>
      <li data-item="toTop">置于顶层</li>
      <li data-item="toBottom">置于底层</li>
      <li data-item="up">上移一层</li>
      <li data-item="down">下移一层</li>
      <li :class="{lock:isLocked,unlock:!isLocked}"
          data-item="lock">锁定大小和位置</li>
      <li :class="{lock:!isLocked,unlock:isLocked}"
          data-item="unlock">解除大小和位置锁定</li>
    </ul>
  </div>
</template>

<script>
// import { mapState } from "vuex"
export default {
  props: {
    isLocked: {
      require: true,
      type: Boolean,
    },
    isShow: {
      require: true,
      type: Boolean,
    }
  },
  data () {
    return {
    }
  },
  methods: {
    handleMenu (e) {
      e.stopPropagation();
      e.preventDefault();
      switch (e.srcElement.dataset.item) {
        case 'deleteComponent':
          this.deleteComponent();
          break;
        case 'toTop':
          this.toTop();
          break;
        case 'toBottom':
          this.toBottom();
          break;
        case 'up':
          this.up();
          break;
        case 'down':
          this.down();
          break;
        case 'lock':
          this.lock();
          break;
        case 'unlock':
          this.unlock();
          break;
      }
      this.$emit("close");
    },
    deleteComponent () {
      this.$store.commit("deleteComponent");
    },
    toTop () {
      this.$store.commit("topComponentIndex");
    },
    toBottom () {
      this.$store.commit("bottomComponentIndex");
    },
    up () {
      this.$store.commit("upComponentIndex");
    },
    down () {
      this.$store.commit("downComponentIndex");
    },
    lock () {
      this.$store.commit("lockComponent");
    },
    unlock () {
      this.$store.commit("unlockComponent");
    }
  },
  computed: {
    show () {
      return this.isShow;
    }
  }

}
</script>
<style scoped>
.contextmenu {
  position: absolute;
  z-index: 1000;
}
.block {
  display: block;
}
.none {
  display: none;
}
.contextmenu ul {
  list-style: none;
  background-color: #fff;

  text-align: center;
  box-shadow: 2px 2px 2px rgba(122, 122, 122, 0.3);
  border: 1px solid #e4e7ed;
  border-bottom: none;
  /* padding: 3px 0; */
}
.contextmenu ul li {
  overflow: hidden;
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  border-bottom: 1px solid #e4e7ed;
}
.contextmenu ul li:hover {
  background-color: #e4e7ed;
}
.lock {
  text-decoration: line-through;
}
.contextmenu ul li.lock:hover {
  background-color: #fff;
}
.unlock {
  text-decoration: none;
}
</style>
