

type ThreeLayerOption = {
  map: any
}

export default class ThreeLayer{
  public scene;
  public camera;
  public renderer;

  private map;
  private container;

  constructor(option: ThreeLayerOption){
    //地图是必须项
    if (option.map === undefined || option.map == null || typeof option.map.getContainer !== 'function'){
      throw Error('config.map invalid');
    }
    this.map = option.map;

  }
}