//组件属性
const list = [
  {
    component: 'u-text',
    label: '文字',
    propValue: '文字',
    icon: 'el-icon-edit',
    locked: false,
    style: {
      width: 200,
      height: 33,
      left: 0,
      top: 0,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 33,
      letterSpacing: 0,
      textAlign: '',
      color: '',
      borderWdith: 1,
      rotate: 0,
      // zIndex: 1,
    },
    attrComponent: {
      hasPositionSize: true,
      hasBackground: true,
      hasBorder: true,
      hasBorderRadius: true,
      hasTextDecration: true,
    }
  },
  {
    component: "u-picture",
    label: "图片",
    icon: 'el-icon-picture',
    locked: false,
    style: {
      width: 200,
      height: 33,
      left: 0,
      top: 0,
      letterSpacing: 0,
      textAlign: '',
      borderWdith: 1,
      rotate: 0,
      // zIndex: 1,
    },
    attrComponent: {
      hasPositionSize: true,
      hasBackground: true,
      hasBorder: true,
      hasBorderRadius: true,
      hasTextDecration: true,
    }
  },
  {
    component: "u-button",
    label: "按钮",
    icon: 'el-icon-thumb',
    locked: false,//是否锁定编辑
    style: {
      width: 200,
      height: 33,
      left: 0,
      top: 0,
      letterSpacing: 0,
      textAlign: '',
      borderWdith: 1,
      rotate: 0,
      // zIndex: 1,
    }
  }
];
export default list