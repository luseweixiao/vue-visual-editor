<template>
  <div class="PageTags">
    <button @click="addPage">add page</button>
    <ul v-if="pageList.lenght!=0">
      <li v-for="(item,index) in pageList"
          :key="item.id">
        <pageTag v-bind:index="index"
                 v-bind:name="item.name" />
      </li>
    </ul>
  </div>
</template>

<script>
import PageTag from './PageTag'
import { mapState } from 'vuex'
import Page from './Page'
export default {
  components: {
    PageTag
  },
  data () {
    return {
      index: 0
    }
  },
  computed: {
    ...mapState(["pageList", "currPageIndex", "pageID", "editorStyleData"])
  },
  methods: {
    addPage () {
      var id = this.pageID + 1;
      var page = new Page("页面" + id, id, { width: this.editorStyleData.width, height: this.editorStyleData.height, background: 'none', backgroundColor: '#fff', backgroundImage: 'none' }, []);
      this.$store.commit("addPage", page);
    }
    ,
  }
}
</script>
<style  scoped>
</style>
