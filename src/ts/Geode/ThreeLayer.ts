import { AxesHelper, PerspectiveCamera, Scene, WebGLRenderer } from "three";

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

  public layer: any;

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

  async init(){
    this.layer = await this.createGlCustomLayer();


    const axesHelper = new AxesHelper(1500)
    this.scene.add(axesHelper)



  }

  //创建非独立图层
  createGlCustomLayer () {
    return new Promise((resolve) => {
      //@ts-ignore
      const layer = new AMap.GLCustomLayer({
        zIndex: 120,
        //设置为true时才会执行init
        visible: true, 
        init: (gl) => {
          this.initThree(gl);
          resolve(layer);
        },
        render: (gl) => {
          //注意：这个方法是放在关键帧里面执行的，所以调用会非常频繁
          this.updateCamera();
        }
      })
      this.map.add(layer);
    })
  }

  //初始化three实例
  initThree (gl) {
    //第1步：创建scene
    this.scene = new Scene();

    //第2步：创建camera，注意这里并没有设置相机的位置，而是在关键帧方法里面执行updateCamera，从而设置相机位置
    const { clientWidth, clientHeight } = this.container;
    this.camera = new PerspectiveCamera(60, clientWidth / clientHeight, 100, 1 << 30);

    //第3步：创建renderer，注意这里多加设置了渲染器的上下文gl
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: false,
      precision: 'highp',
      context: gl
    });
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    //必须设置为false才能实现多个render的叠加
    renderer.autoClear = false;
    renderer.setClearAlpha(0);

    this.renderer = renderer;
  }

  //更新相机
  updateCamera () {
    const { scene, renderer, camera, customCoords } = this;
    if (!renderer) {
      return;
    }
    //重新定位中心，这样才能使当前图层与Loca图层共存时显示正常
    if (this.center) {
      customCoords.setCenter(this.center);
    }
    const { near, far, fov, up, lookAt, position } = customCoords.getCameraParams();
    //近平面
    camera.near = near;
    //远平面
    camera.far = far;
    //视野范围
    camera.fov = fov;
    camera.position.set(...position);
    camera.up.set(...up);
    camera.lookAt(...lookAt);
    //更新相机坐标系
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    //这里必须执行，重新设置 three 的 gl 上下文状态
    renderer.resetState();
  }

  //设置图层中心坐标，非常重要
  updateCenter (lngLat) {
    if (lngLat instanceof Array && lngLat.length === 2) {
      this.customCoords.setCenter(lngLat);
    }
  }
}