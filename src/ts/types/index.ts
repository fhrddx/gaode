import { Color, Texture } from "three"

type pointItem = {
  province: string,
  count: number,
  center: number[]
}

type saleItem = {
  province: string,
  provinceEn: string,
  count: number,
  rank: number,
  center: number[]
}

//注解：光柱以及底座的颜色
type punctuation = {
  //注解：底座蓝色光圈的颜色
  circleColor: number,
  //注解：光柱
  lightColumn: {
    //注解：光柱作为起点的颜色
    startColor: number,
    //注解：光柱作为终点的颜色
    endColor: number,
  },
}

type earthOptions = {
  data: {
    startArray: {
      name: string,
      E: number, //经度
      N: number, //维度
    },
    endArray: {
      name: string,
      E: number, //经度
      N: number, //维度
    }[]
  }[]
  textures: Record<string, Texture>, //贴图
  earth: {
    radius: number,      //地球半径
    rotateSpeed: number, //地球旋转速度
    isRotation: boolean  //地球组是否自转
  }
  satellite: {
    show: boolean,       //是否显示卫星
    rotateSpeed: number, //旋转速度
    size: number,        //卫星大小
    number: number,      // 一个圆环几个球
  },
  punctuation: punctuation,
  flyLine: {
    color: number,        //飞线轨道的颜色
    speed: number,        //飞线拖尾线速度
    flyLineColor: number  //飞线的颜色
  },
}

type uniforms = {
  glowColor: { value: Color; }
  scale: { type: string; value: number; }
  bias: { type: string; value: number; }
  power: { type: string; value: number; }
  time: { type: string; value: any; }
  isHover: { value: boolean; };
  map: { value: Texture }
}

type mapOptions = {
  planeColor: number,
  sideColor: number,
  lineColor: number,
  activePlaneColor : number,
  activeSideColor: number,
  activeLineColor: number,
  deep: number,
  barheightmax: number,
  barheightmin: number,
  sideTexture: Texture,
  huiguangTexture: Texture,
  guangquan01: Texture,
  guangquan02: Texture,
  pointTexture: Texture,
  rotationBorder1: Texture,
  rotationBorder2: Texture,
  pathLine: Texture,
  animatedPathLine: boolean
}

type mapInfo = {
  code: number,
  name: string,
  center: number[]
}

type mapSizeConfig = {
  jindu: number,
  weidu: number,
  scale: number
}

type callbackEvent = {
  eventKey: string,
  eventValue: any
}

export default punctuation;
export { earthOptions,  uniforms, mapOptions, saleItem, pointItem, mapInfo, mapSizeConfig, callbackEvent };