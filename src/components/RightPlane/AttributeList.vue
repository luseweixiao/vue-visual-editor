<template>
  <div class="attribuite-list">
    <el-form>
      <el-form-item v-if="currComponentIndex==-1 && currPageIndex>-1"
                    label="背景颜色">
        <el-color-picker v-model="pageList[currPageIndex].style.backgroundColor"></el-color-picker>
      </el-form-item>
      <el-form-item v-if="currComponentIndex==-1 && currPageIndex>-1"
                    label="背景图片">
        <el-switch :value="pageList[currPageIndex].style.backgroundImage!='none'"
                   active-color="#13ce66"
                   inactive-color="#ff4949"
                   @change="handleChangeBg">
        </el-switch>
        <input ref="fileinput"
               type="file"
               @change="selectImg">
      </el-form-item>
      <el-form-item v-for="(value,name) in styleKeys"
                    :key="name"
                    :label="map[name]">
        <el-color-picker v-if="name == 'borderColor'"
                         v-model="styleKeys[name]"></el-color-picker>
        <el-color-picker v-else-if="name == 'color'"
                         v-model="styleKeys[name]"></el-color-picker>
        <el-color-picker v-else-if="name == 'backgroundColor'"
                         v-model="styleKeys[name]"></el-color-picker>
        <el-select v-else-if="name == 'textAlign'"
                   v-model="styleKeys[name]">
          <el-option v-for="item in textAlignOptions"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
        <el-select v-else-if="name=='alignItems'"
                   v-model="styleKeys[name]">
          <el-option v-for="item in alignItemsOptions"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value">
          </el-option>
        </el-select>
        <el-input type="number"
                  v-else-if="!excludesNoneUnitStyle.includes(name)"
                  v-model="styleKeys[name]" />

        <!-- 边框样式：solid|none -->
        <div class="borderStyle"
             @click="changeBorderStyle"
             v-else-if="name == 'borderStyle'">
          <button class="borderStyle-top"
                  data-borderstyle="top"
                  :class="{borderStyleNone:borderStyle[0]=='none'}"></button>
          <button class="borderStyle-right"
                  data-borderstyle="right"
                  :class="{borderStyleNone:borderStyle[1]=='none'}"></button>
          <button class="borderStyle-bottom"
                  data-borderstyle="bottom"
                  :class="{borderStyleNone:borderStyle[2]=='none'}"></button>
          <button class="borderStyle-left"
                  data-borderstyle="left"
                  :class="{borderStyleNone:borderStyle[3]=='none'}"></button>
        </div>

      </el-form-item>

      <!-- font-style\text-decoration -->
      <el-form-item label="文本样式"
                    v-if="currComponent && !excludes.includes(currComponent.component)&&currComponentIndex>=0">
        <el-button @click="changeFontStyle"
                   :class="{isitalic:isitalic,buttonnormal:!isitalic}">
          <i class="iconfont iconitalics"></i>
        </el-button>
        <el-button @click="changeTextDecoration"
                   :class="{isunderline:isunderline,buttonnormal:!isunderline}">
          <!-- <i class="el-icon-edit icon-style"></i> -->
          <i class="iconfont iconUnderline"></i>
        </el-button>
      </el-form-item>

      <el-form-item label="内容"
                    v-if="currComponent && !excludes.includes(currComponent.component)&&currComponentIndex>=0">
        <el-input type="textarea"
                  v-model="currComponent.propValue" />
      </el-form-item>

      <el-form-item label="循环播放"
                    v-if="currComponentIndex>=0&&excludes.includes(currComponent.component)">
        <el-switch v-bind:value="currComponent.auto"
                   active-color="#13ce66"
                   inactive-color="#ff4949"
                   @change="handleAutoChange">
        </el-switch>

      </el-form-item>
      <el-form-item label="间隔秒数"
                    v-if="currComponentIndex>=0&&excludes.includes(currComponent.component)">
        <el-input type="number"
                  v-model="currComponent.autoTime"
                  min=1></el-input>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import { mapState } from "vuex"
import '@/styles/iconfont.css'
import { validateImage } from "@/utils/imageHelper"
export default {
  data () {
    return {
      isitalic: false,
      isunderline: false,
      color: "#fff",
      imageUrl: "",
      excludes: ['u-picture'], // 这些组件不显示内容
      excludesNoneUnitStyle: [
        "textDecoration",
        "fontStyle",
        "borderStyle",
      ],
      textAlignOptions: [
        {
          label: '左对齐',
          value: 'left',
        },
        {
          label: '居中',
          value: 'center',
        },
        {
          label: '右对齐',
          value: 'right',
        },
        {
          label: '两端对齐',
          value: 'justify',
        }
      ],
      alignItemsOptions: [
        {
          label: '上对齐',
          value: 'flex-start'
        },
        {
          label: '居中对齐',
          value: 'center'
        }, {
          label: '下对齐',
          value: 'flex-end'
        },
      ],
      map: {
        left: 'x 坐标',
        top: 'y 坐标',
        height: '高',
        width: '宽',
        fontSize: '字体大小',
        fontWeight: '字体粗细',
        color: '字体颜色',
        backgroundColor: '背景色',
        backgroundImage: '',
        borderWidth: '边框宽度',
        borderColor: '边框颜色',
        borderStyle: "边框可见性",
        // borderRadius: '圆角半径',
        borderTopLeftRadius: '左上角半径',
        borderTopRightRadius: '右上角半径',
        borderBottomRightRadius: '右下角半径',
        borderBottomLeftRadius: '左下角半径',

        lineHeight: '行高',
        letterSpacing: '字间距',
        textAlign: '对齐方式',
        opacity: '透明度',
      },
    }
  }
  ,
  methods: {
    handleChangeBg (val) {
      // console.log("handleChangeBg", typeof this.$refs.fileinput.files)
      // delete this.$refs.fileinput.files[0]
      this.$store.commit("setPageBackgroundImage", val);
    },
    handleAutoChange (val) {
      let currComponent = this.currComponent;
      currComponent.auto = val;
      this.$store.commit("setCurrComponent", { component: currComponent, index: this.currComponentIndex });
    },
    async selectImg ({ currentTarget: inputNode }) {
      try {
        const file = inputNode.files
        const imgFile = file && file[0]
        await validateImage(imgFile)
        // console.log(imgFile)
        const src = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result)
          }
          reader.onerror = reject
          reader.readAsDataURL(imgFile)
        });
        let style = this.pageList[this.currPageIndex].style;
        style.background = "url(" + src + ")";
        style.backgroundImage = "url(" + src + ")";
        this.$store.commit("changePageInfo", { name: "style", index: this.currPageIndex })
      } catch (e) {
        console.error(e)
      } finally {
        // inputNode.value = src
      }
    },
    changeBorderStyle (e) {
      e.stopPropagation();
      e.preventDefault();

      switch (e.srcElement.dataset.borderstyle) {
        case 'top':
          console.log(this.borderStyle[0] == "solid")
          this.borderStyle[0] = this.borderStyle[0] == "solid" ? "none" : "solid";
          break;
        case 'right':
          this.borderStyle[1] = this.borderStyle[1] == "solid" ? "none" : "solid";
          break;
        case 'bottom':
          this.borderStyle[2] = this.borderStyle[2] == "solid" ? "none" : "solid";
          break;
        case 'left':
          this.borderStyle[3] = this.borderStyle[3] == "solid" ? "none" : "solid";
          break;
      }

      this.currComponent.style.borderStyle = this.borderStyle.join(" ");
      console.log(this.borderStyle);
      this.$store.commit("setCurrComponent", { component: this.currComponent, index: this.currComponentIndex })
    },
    changeFontStyle () {
      if (this.styleKeys["fontStyle"] == "italic") {
        this.styleKeys["fontStyle"] = "normal";
        this.isitalic = false;
      } else {
        this.styleKeys["fontStyle"] = "italic";
        this.isitalic = true;
      }
    },
    changeTextDecoration () {
      if (this.styleKeys["textDecoration"] == "underline") {
        this.styleKeys["textDecoration"] = "none";
        this.isunderline = false;
      } else {
        this.styleKeys["textDecoration"] = "underline";
        this.isunderline = true;
      }
    }
  },
  computed: {
    ...mapState(["pageList", "currPageIndex", "currComponentIndex", "currComponent"]),
    styleKeys () {
      if (this.currComponentIndex >= 0) {
        return this.currComponent ? this.currComponent.style : {}
      } else {
        return null;
      }
    },
    borderStyle () {
      return this.currComponent.style.borderStyle.split(' ');
    },
  }
}

</script>

<style scoped>
.attribuite-list {
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 0;
  /* height: 100%; */
}
</style>
<style lang="scss">
.el-form {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2px;

  & > div.el-form-item {
    margin-bottom: 5px;

    & > .el-form-item__label {
      width: 80px;
      padding-right: 6px;
    }
    & > .el-form-item__content {
      line-height: 25px;

      & > .el-input {
        width: 40%;

        & > .el-input__inner {
          padding: 0 5px;
        }
      }
      & > .el-button {
        display: inline-block;
        margin: 0;
        padding: 6px 10px;
        color: #000;
      }
      & > .buttonnormal {
        background-color: #fff;
        & > i {
          font-size: 18px;
          color: #3498db;
        }
      }

      & > .isunderline,
      .isitalic {
        background-color: #3498db;
        i {
          color: #fff;
        }
      }

      // 边框样式：none|solid
      .borderStyle {
        $bsWidth: 30px;
        $btnBg: #3498db;
        $btnBgNone: #ecf0f1;
        $btnArg1: -10%;
        $btnArg2: 15%;
        $btnWidth: 70%;
        $btnHeight: 20%;

        position: relative;
        width: $bsWidth;
        height: $bsWidth;
        border: 1px solid #000;
        right: -120px;

        .borderStyle-top,
        .borderStyle-bottom {
          position: absolute;
          width: $btnWidth;
          height: $btnHeight;
          background-color: $btnBg;
          border: none;
          outline: none;
        }

        .borderStyle-left,
        .borderStyle-right {
          position: absolute;
          width: $btnHeight;
          height: $btnWidth;
          background-color: $btnBg;
          border: none;
          outline: none;
        }

        .borderStyle-top {
          top: $btnArg1;
          left: $btnArg2;
        }

        .borderStyle-right {
          right: $btnArg1;
          top: $btnArg2;
        }

        .borderStyle-bottom {
          bottom: $btnArg1;
          left: $btnArg2;
        }

        .borderStyle-left {
          left: $btnArg1;
          top: $btnArg2;
        }

        .borderStyleNone {
          background-color: $btnBgNone;
        }
      }
    }
  }
}

.el-select-dropdown__item {
  padding: 0;
  height: 24px;
  line-height: 24px;
  width: 70%;
}
</style>
