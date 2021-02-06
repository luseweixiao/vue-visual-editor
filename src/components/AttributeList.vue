<template>
  <div class="attribuite-list">
    <el-form>
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
          <el-option v-for="item in options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
        <el-input type="number"
                  v-else
                  v-model="styleKeys[name]" />
      </el-form-item>
      <el-form-item label="内容"
                    v-if="currComponent && !excludes.includes(currComponent.component)&&currComponentIndex>=0">
        <el-input type="textarea"
                  v-model="currComponent.propValue" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState } from "vuex"
export default {
  data () {
    return {
      color: "#fff",
      excludes: ['UPicture'], // 这些组件不显示内容
      options: [
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
      map: {
        left: 'x 坐标',
        top: 'y 坐标',
        height: '高',
        width: '宽',
        color: '颜色',
        backgroundColor: '背景色',
        borderWidth: '边框宽度',
        borderColor: '边框颜色',
        borderRadius: '边框半径',
        fontSize: '字体大小',
        fontWeight: '字体粗细',
        lineHeight: '行高',
        letterSpacing: '字间距',
        textAlign: '对齐方式',
        opacity: '透明度',
      },
    }
  }
  ,
  computed: {
    ...mapState(["pageList", "currPageIndex", "currComponentIndex", "currComponent"]),
    styleKeys () {
      if (this.currComponentIndex >= 0) {
        var style = this.currComponent ? this.currComponent.style : {};
        return style;
      } else {
        return null;
      }

    },
  }
}
</script>

<style scoped>
.attribuite-list {
  overflow: auto;
  padding-top: 0;
  height: 100%;
}
</style>
<style>
.el-form {
  overflow: auto;
  padding: 5px;
}
.el-form-item__label {
  width: 70px;
}
.el-form div.el-form-item {
  margin-bottom: 2px;
}
.el-form div.el-form-item__content {
  line-height: 25px;
}
.el-form-item__content .el-input {
  width: 40%;
}
.el-input .el-input__inner {
  padding: 0;
}
.el-select-dropdown__item {
  padding: 0;
  height: 24px;
  line-height: 24px;
  width: 70%;
}
/* .el-select-dropdown {
  min-width: 90px;
} */
</style>