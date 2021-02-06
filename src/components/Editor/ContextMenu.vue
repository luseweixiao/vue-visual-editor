<template>
  <div class="contextmenu"
       v-show="menuShow">
    <ul>
      <li @click="deleteComponent">删除</li>
      <li @click="toTop">置于顶层</li>
      <li @click="toBottom">置于底层</li>
      <li @click="up">上移一层</li>
      <li @click="down">下移一层</li>
      <li @click="lock"
          :class="{lock:isLocked,unlock:!isLocked}">锁定大小和位置</li>
      <li @click="unlock"
          :class="{lock:!isLocked,unlock:isLocked}">解除大小和位置锁定</li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex"
// import store from "@/store"
export default {
  props: {
    isLocked: {
      require: true,
      type: Boolean,
    }

  },
  data () {
    return {

    }
  },
  methods: {
    deleteComponent (e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit("deleteComponent");
      this.$store.commit("hideContextMenu");
    },
    toTop (e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit("topComponentIndex");
      this.$store.commit("hideContextMenu");
    },
    toBottom (e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit("bottomComponentIndex");
      this.$store.commit("hideContextMenu")
    },
    up (e) {
      e.stopPropagation();
      e.preventDefault();

      this.$store.commit("upComponentIndex");
      this.$store.commit("hideContextMenu")
    },
    down (e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit("downComponentIndex");
      this.$store.commit("hideContextMenu")
    },
    lock (e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit("lockComponent");
      this.$store.commit("hideContextMenu")
    },
    unlock (e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit("unlockComponent");
      this.$store.commit("hideContextMenu")
    }
  },
  computed: {
    ...mapState(["currComponent", "pageList", "menuShow"]),
    top () {
      if (this.currComponent) {
        return this.currComponent.style.top + this.currComponent.style.height;
      } else {
        return 0;
      }
    },
    left () {
      if (this.currComponent) {
        return this.currComponent.style.left + this.currComponent.style.width / 2;
      } else {
        return 0;
      }

    }
  }

}
</script>
<style scoped>
.contextmenu {
  position: absolute;
  z-index: 1000;
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
  whtie-space: nowrap;
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