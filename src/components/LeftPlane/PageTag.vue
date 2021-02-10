<template>
  <div class="pageTag">
    <span class="pagetag-index"
          :class="{isCurrPage:index==currPageIndex}">{{index+1}}</span>
    <input class="pagetag-input"
           v-model.lazy="pageName"
           @blur="changePageInfo">
    <ul class="pagetag-icons">
      <li class="pagetag-icon edit">
        <i class="el-icon-edit icon-style"
           @click="changeEditModel"></i>
      </li>
      <li class="pagetag-icon icon-pulldown"
          @click="changeToolbarMode"
          @blur="blur">
        <i class="el-icon-arrow-down icon-style"></i>
        <ul class="toolbar"
            :class="{slideup:!isToolBarShow,slidedown:isToolBarShow}">
          <li @click="addPage">新增</li>
          <li @click="copyPage">复制</li>
          <li @click="deletePage">删除</li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex"
import Page from "./Page"
export default {
  props: {
    index: Number,
    name: String,
  },
  data () {
    return {
      isToolBarShow: false,
      pageName: this.name,
    }
  },
  components: {
    // Toolbar
  },
  methods: {
    blur () {
      console.log("blur")
    },
    changeToolbarMode () {
      this.isToolBarShow = !this.isToolBarShow;
    },
    changeEditModel () {
      this.$store.commit("changeCurrPageIndex", this.index);
      // this.$store.commit("changeCurrComponentIndex", 0);
      this.$store.commit("changeEditMode", true);
    },

    changePageInfo () {
      console.log(this.pageName)
      this.$store.commit("changePageInfo", { name: this.pageName, index: this.index });
    },
    addPage () {
      var id = this.pageID + 1;
      var page = new Page("页面" + id, id, { width: this.editorStyleData.width, height: this.editorStyleData.height, background: 'none', backgroundColor: '#fff', backgroundImage: 'none' }, []);
      this.$store.commit("addPage", page);
    },
    copyPage () {
      this.$store.commit("copyPage", this.index);
    },
    deletePage () {
      this.$store.commit("deletePage", this.index);
      console.log("delete")
    },
  },
  computed: {
    ...mapState(["pageList", "currPageIndex", "pageID", "editorStyleData"])
  }
}
</script>

<style lang="scss" scope>
.pageTag {
  background-color: rgb(228, 222, 222);
  border-top: 1px solid rgba(121, 121, 121, 1);
  border-bottom: 1px solid rgba(121, 121, 121, 1);
  margin: 5px 0;
  position: relative;
  height: 24px;
  & > .isCurrPage {
    background-color: blue;
    color: #fff;
  }
}
.pageTag span {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
}
.pagetag-index {
  position: absolute;
  left: 1px;
  top: 1px;
  color: #000;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #555;
}
.pagetag-input {
  position: absolute;
  left: 23px;
  right: 0px;
  height: 20px;
  border: none;
  outline: none;
  text-indent: 5px;
}
/* icons */
ul.pagetag-icons {
  list-style: none;
  width: 40px;
  height: 20px;
  position: absolute;
  /* z-index: 12; */
  top: 0;
  right: 0;
  border: none;
}
ul.pagetag-icons > li {
  display: inline-block;
  border: none;
  outline: none;
  margin-right: 5px;
}
.icon-style {
  color: rgb(22, 155, 213);
}
/* .pagetag-icon img {
  width: 20px;
  height: 18px;
} */
.pagetag-icon :hover {
  cursor: pointer;
  /* border: 1px solid #1296db; */
}
.IsFocus {
  border: 1px solid red;
}
/* pulldown toolbar */
.pulldow {
  position: relative;
}
ul.toolbar {
  position: absolute;
  top: 21px;
  right: 0px;
  left: 4px;
  z-index: 1000;
  background-color: #fff;
  opacity: 1;
  list-style: none;
  font-weight: 400;
  font-size: 12px;
  /* background-color: rgba(215, 215, 215, 1); */
  border: 1px solid rgba(121, 121, 121, 1);
  padding: 1px;
}
ul.toolbar li {
  padding: 2px;
}
ul.toolbar li:hover {
  background-color: antiquewhite;
  cursor: pointer;
}
.slideup {
  display: none;
}
.slidedown {
  display: block;
}
</style>
