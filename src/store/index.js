import Vue from 'vue'
import Vuex from 'vuex'
import { deepCopy, swap } from '@/utils/utils'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    editMode: false,//页面编辑模式
    pageList: [],//页面列表
    editorStyleData: {//编辑区全局数据
      width: 600,
      height: 700
    },
    pageID: 0,//页ID,应该存在localstorage或是服务器，作为页面唯一ID
    currPageIndex: -1,//当前页面下标
    // currComponentList: [],//当前画布上组件
    currComponent: null,
    currComponentIndex: -1,//当前组件下表
    // copyData: null,//复制粘贴剪切数据，后面做组件复制时用
    menuShow: false,//右键菜单显示
    preventDeactivation: true,//false:当点其他位置时，组件会失去焦点,true：点击其他位置，组件不会失去焦点
    snap: true,
    snapTolerance: 6
  },
  mutations: {
    setPreventDeactivation (state, payload) {
      state.preventDeactivation = payload;
    },
    // -------------------页面管理-----------------
    copyPage (state, index) {
      let page = deepCopy(state.pageList[index]);
      page.id = state.pageID + 1;
      page.name = "页面" + page.id;
      store.commit("addPage", page);
    },

    addPage (state, page) {
      state.pageList.push(page);
      state.pageID = state.pageID + 1;
    },

    deletePage (state, index) {
      state.pageList.splice(index, 1);

      if (index == state.currPageIndex) {
        state.editMode = false;
        state.currPageIndex = -1;
      } else if (index < state.currPageIndex) {
        state.currPageIndex = state.currPageIndex - 1;
      }
    },

    changeCurrPageIndex (state, index) {
      state.currPageIndex = index;
      state.currComponentIndex = -1;
      state.currComponent = null;
    },

    setPageBackgroundImage (state, payload) {
      if (payload == false) {
        Vue.set(state.pageList[state.currPageIndex].style, 'backgroundImage', 'none');
      }
      else {
        Vue.set(state.pageList[state.currPageIndex].style, 'backgroundImage', state.pageList[state.currPageIndex].style.background);
      }
    },

    changePageInfo (state, payload) {
      var { name, index } = payload;
      state.pageList[index].name = name;
    },

    changePageStyle (state, style) {
      Vue.set(state.pageList[state.currPageIndex], "style", style);
    },

    setPageList (state, page) {
      Vue.set(state.pageList, state.currPageIndex, page);
    },
    // ----------------------------------------------------
    // ---------------------组件编辑------------------------

    changeCurrComponentIndex (state, index) {
      state.currComponentIndex = index;
    },

    addComponentToCurrPage (state, component) {
      store.commit("addComponentToPage", { pageIndex: state.currPageIndex, component });
      state.menuShow = false;
    },

    addComponentToPage (state, payload) {
      var { pageIndex, component } = payload;

      //添加组件后，焦点给新增的组件
      store.commit("setCurrComponent", { component, index: state.pageList[pageIndex].componentsData.length });
    },

    setComponentsData (state, payload) {
      let { component, currComponentIndex } = payload;
      Vue.set(state.pageList[state.currPageIndex].componentsData, currComponentIndex, component);
    },

    setCurrComponent (state, { component, index }) {
      Vue.set(state, "currComponent", component);
      store.commit("changeCurrComponentIndex", index);
      store.commit("setComponentsData", { component, currComponentIndex: index });
    },

    changeEditMode (state, editmode) {
      state.editMode = editmode;
    },

    // ----------------右键菜单-------------------------
    changeMenuShow (state, payload) {
      state.menuShow = payload;
    },

    deleteComponent (state) {
      state.pageList[state.currPageIndex].componentsData.splice(state.currComponentIndex, 1);
      Vue.set(state, "currComponent", null);
      state.currComponentIndex = -1;
      state.menuShow = false;
    },

    upComponentIndex (state) {
      let componentsData = state.pageList[state.currPageIndex].componentsData;
      if (state.currComponentIndex < componentsData.length - 1) {
        componentsData.splice(state.currComponentIndex, 1);
        componentsData.splice(state.currComponentIndex + 1, 0, state.currComponent);
        state.currComponentIndex = state.currComponentIndex + 1;
      } else {
        alert("已经到顶了");
      }
    },

    downComponentIndex (state) {
      let componentsData = state.pageList[state.currPageIndex].componentsData;
      if (state.currComponentIndex > 0) {
        componentsData.splice(state.currComponentIndex, 1)
        componentsData.splice(state.currComponentIndex - 1, 0, state.currComponent);
        state.currComponentIndex = state.currComponentIndex - 1;
      } else {
        alert("已经到底了");
      }
    },

    bottomComponentIndex (state) {
      let componentsData = state.pageList[state.currPageIndex].componentsData;
      if (componentsData.length > 1) {
        componentsData.splice(state.currComponentIndex, 1);
        componentsData.unshift(state.currComponent);
        state.currComponentIndex = 0;
      }
    },

    topComponentIndex (state) {
      let componentsData = state.pageList[state.currPageIndex].componentsData;
      if (componentsData.length > 1) {
        componentsData.splice(state.currComponentIndex, 1);
        componentsData.push(state.currComponent);
        state.currComponentIndex = componentsData.length - 1;
      }
    },

    lockComponent (state) {
      state.currComponent.locked = true;
      store.commit("setCurrComponent", { component: state.currComponent, index: state.currComponentIndex });

    },

    unlockComponent (state) {
      state.currComponent.locked = false;
      store.commit("setCurrComponent", { component: state.currComponent, index: state.currComponentIndex });
    },

    // ----------------组件事件--------------------
    addEvent (state, { event, param }) {
      Vue.set(state.currComponent.events, event, param);
      store.commit("setCurrComponent", { component: state.currComponent, index: state.currCompoentIndex });
    },

    removeEvent (state, event) {
      Vue.delete(state.currComponent.events, event);
      store.commit("setCurrComponent", { component: state.currComponent, index: state.currCompoentIndex });
    }
  },
  getters: {
    // componentsData (state) {
    //   return state.pageList[state.currPageIndex].componentsData;
    // }
  }
});

export default store

