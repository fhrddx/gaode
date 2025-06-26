

type ThreeLayerOption = {
  map: any,
  container?: any,
  interact?: boolean,
  id?: string,
  center?: number[],
}

export default class ThreeLayer{
  public scene;
  public camera;
  public renderer;

  private map;
  private container;
  private interactAble: boolean;
  private customCoords: any;
  private id: string;
  private center: number[];

  constructor(option: ThreeLayerOption){
    //地图是必须项
    if (option.map === undefined || option.map == null || typeof option.map.getContainer !== 'function'){
      throw Error('config.map invalid');
    }
    this.map = option.map;

    //默认取地图容器
    this.container = option.container || option.map.getContainer();
    if (!this.container){
      throw Error('config.container invalid');
    }

    //是否支持鼠标交互等操作
    this.interactAble = option.interact || false;
    //高德地图坐标转化工具
    this.customCoords = this.map.customCoords;
    //图层编号
    this.id = option.id || new Date().getTime().toString();

    //如果传过来的中心点跟高德地图的中心点不一致， 以传过来的中心点重新更新下地图坐标
    if (option.center) {
      this.updateCenter(option.center);
      this.center = option.center;
    } else {
      const { lng, lat } = this.map.getCenter();
      this.center = [lng, lat];
    }
  }

  //设置图层中心坐标，非常重要
  updateCenter (lngLat) {
    if (lngLat instanceof Array && lngLat.length === 2) {
      this.customCoords.setCenter(lngLat);
    }
  }
}