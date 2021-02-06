import { calculateRotatedPointCoordinate, getCenterPoint } from './translate'
import store from '@/store'

const funcs = {
  lt: calculateLeftTop,
  t: calculateTop,
  rt: calculateRightTop,
  r: calculateRight,
  rb: calculateRightBottom,
  b: calculateBottom,
  lb: calculateLeftBottom,
  l: calculateLeft,
}
const Lock = {
  t: false,
  r: false,
  b: false,
  l: false,
};
function calculateLeftTop (style, curPositon, pointInfo) {
  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
  const newTopLeftPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -style.rotate)
  const newBottomRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)

  const newWidth = newBottomRightPoint.x - newTopLeftPoint.x
  const newHeight = newBottomRightPoint.y - newTopLeftPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Lock.l ? style.width : Math.round(newWidth)
    style.height = Lock.t ? style.height : Math.round(newHeight)
    style.left = Lock.l ? 0 : Math.round(newTopLeftPoint.x)
    style.top = Lock.t ? 0 : Math.round(newTopLeftPoint.y)
  }
}

function calculateTop (style, curPositon, pointInfo) {
  const { symmetricPoint, curPoint } = pointInfo
  const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -style.rotate)
  const rotatedTopMiddlePoint = calculateRotatedPointCoordinate({
    x: curPoint.x,
    y: rotatedcurPositon.y,
  }, curPoint, style.rotate)

  // 勾股定理
  const newHeight = Math.sqrt((rotatedTopMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedTopMiddlePoint.y - symmetricPoint.y) ** 2)

  if (newHeight > 0) {
    const newCenter = {
      x: rotatedTopMiddlePoint.x - (rotatedTopMiddlePoint.x - symmetricPoint.x) / 2,
      y: rotatedTopMiddlePoint.y + (symmetricPoint.y - rotatedTopMiddlePoint.y) / 2,
    }

    style.height = Lock.t ? style.height : Math.round(newHeight)
    style.top = Lock.t ? 0 : Math.round(newCenter.y - (newHeight / 2))
    style.left = Math.round(newCenter.x - (style.width / 2))
  }
}

function calculateRight (style, curPositon, pointInfo) {
  const { symmetricPoint, curPoint } = pointInfo
  const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -style.rotate)
  const rotatedRightMiddlePoint = calculateRotatedPointCoordinate({
    x: rotatedcurPositon.x,
    y: curPoint.y,
  }, curPoint, style.rotate)

  const newWidth = Math.sqrt((rotatedRightMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedRightMiddlePoint.y - symmetricPoint.y) ** 2)
  if (newWidth > 0) {
    const newCenter = {
      x: rotatedRightMiddlePoint.x - (rotatedRightMiddlePoint.x - symmetricPoint.x) / 2,
      y: rotatedRightMiddlePoint.y + (symmetricPoint.y - rotatedRightMiddlePoint.y) / 2,
    }

    style.width = Lock.r ? Math.round(store.state.editorStyleData.width - style.left) : Math.round(newWidth)
    style.top = Math.round(newCenter.y - (style.height / 2))
    style.left = Lock.r ? style.left : Math.round(newCenter.x - (newWidth / 2))
  }
}

function calculateBottom (style, curPositon, pointInfo) {
  const { symmetricPoint, curPoint } = pointInfo
  const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -style.rotate)
  const rotatedBottomMiddlePoint = calculateRotatedPointCoordinate({
    x: curPoint.x,
    y: rotatedcurPositon.y,
  }, curPoint, style.rotate)

  const newHeight = Math.sqrt((rotatedBottomMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedBottomMiddlePoint.y - symmetricPoint.y) ** 2)
  if (newHeight > 0) {
    const newCenter = {
      x: rotatedBottomMiddlePoint.x - (rotatedBottomMiddlePoint.x - symmetricPoint.x) / 2,
      y: rotatedBottomMiddlePoint.y + (symmetricPoint.y - rotatedBottomMiddlePoint.y) / 2,
    }
    style.height = Lock.b ? style.height : Math.round(newHeight)
    style.top = Lock.b ? style.top : Math.round(newCenter.y - (newHeight / 2))
    style.left = Math.round(newCenter.x - (style.width / 2))
  }
}

function calculateLeft (style, curPositon, pointInfo) {

  const { symmetricPoint, curPoint } = pointInfo
  const rotatedcurPositon = calculateRotatedPointCoordinate(curPositon, curPoint, -style.rotate)
  const rotatedLeftMiddlePoint = calculateRotatedPointCoordinate({
    x: rotatedcurPositon.x,
    y: curPoint.y,
  }, curPoint, style.rotate)

  const newWidth = Math.sqrt((rotatedLeftMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedLeftMiddlePoint.y - symmetricPoint.y) ** 2)
  if (newWidth > 0) {
    const newCenter = {
      x: rotatedLeftMiddlePoint.x - (rotatedLeftMiddlePoint.x - symmetricPoint.x) / 2,
      y: rotatedLeftMiddlePoint.y + (symmetricPoint.y - rotatedLeftMiddlePoint.y) / 2,
    }

    style.width = Lock.l ? style.width : Math.round(newWidth)
    style.top = Math.round(newCenter.y - (style.height / 2))
    style.left = Lock.l ? 0 : Math.round(newCenter.x - (newWidth / 2))
  }
}

function calculateRightTop (style, curPositon, pointInfo) {

  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
  const newTopRightPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -style.rotate)
  const newBottomLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)

  const newWidth = newTopRightPoint.x - newBottomLeftPoint.x
  const newHeight = newBottomLeftPoint.y - newTopRightPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Lock.r ? style.width : Math.round(newWidth)
    style.height = Lock.t ? style.height : Math.round(newHeight)
    style.left = Lock.r ? style.left : Math.round(newBottomLeftPoint.x)
    style.top = Lock.t ? style.top : Math.round(newTopRightPoint.y)
  }
}

function calculateRightBottom (style, curPositon, pointInfo) {
  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
  const newTopLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  const newBottomRightPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -style.rotate)

  const newWidth = newBottomRightPoint.x - newTopLeftPoint.x
  const newHeight = newBottomRightPoint.y - newTopLeftPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Lock.r ? style.width : Math.round(newWidth)
    style.height = Lock.b ? style.height : Math.round(newHeight)
    style.left = Lock.r ? style.left : Math.round(newTopLeftPoint.x)
    style.top = Lock.b ? style.top : Math.round(newTopLeftPoint.y)
  }
}

function calculateLeftBottom (style, curPositon, pointInfo) {
  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
  const newTopRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  const newBottomLeftPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -style.rotate)

  const newWidth = newTopRightPoint.x - newBottomLeftPoint.x
  const newHeight = newBottomLeftPoint.y - newTopRightPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Lock.l ? style.width : Math.round(newWidth)
    style.height = Lock.b ? style.height : Math.round(newHeight)
    style.left = Lock.l ? 0 : Math.round(newBottomLeftPoint.x)
    style.top = Lock.b ? style.top : Math.round(newTopRightPoint.y)
  }
}

function checkLock (name, style, curPoint, pointInfo) {
  let editorStyleData = store.state.editorStyleData;
  let oldPoint = pointInfo.curPoint;

  //通过移动点、移动方向、当前位置判断是否锁定
  Lock.t = (((name == 't' || name == 'rt' || name == 'lt') && curPoint.y <= oldPoint.y) &&
    style.top <= 0) ? true : false;
  Lock.r = (((name == 'r' || name == 'rt' || name == 'rb') && curPoint.x >= oldPoint.x) &&
    style.left + style.width >= editorStyleData.width) ? true : false;
  Lock.b = ((name == 'b' || name == 'rb' || name == 'lb') && curPoint.y >= oldPoint.y) &&
    (style.top + style.height >= editorStyleData.height) ? true : false;
  Lock.l = ((name == 'l' || name == 'lt' || name == 'lb') && curPoint.x <= oldPoint.x &&
    style.left <= 0) ? true : false;
}
//curPoint 点击时在eidtor中的坐标
//curPosition 实时点击点在eidtor中的坐标
export default function calculateComponentPositonAndSize (name, style, curPositon, pointInfo) {
  checkLock(name, style, curPositon, pointInfo)
  funcs[name](style, curPositon, pointInfo)
}