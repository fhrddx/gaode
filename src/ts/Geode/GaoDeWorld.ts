import { AxesHelper } from "three";
import { Resources } from "../world/Resources";
import MapManager from "./MapManager";
import ThreeLayer from "./ThreeLayer";

export default class GaoDeWorld {
  private mapManager: MapManager;
  private map: any;
  private layer: any;
  private resources: Resources;

  constructor(containerId: string){
    this.mapManager = new MapManager({
      containerId: containerId,
      viewMode: '3D',         
      showBuildingBlock: false,
      center: [113.326961, 23.141248],
      zoom: 13.5,
      mapStyle: 'amap://styles/dark',
      skyColor: 'rgba(140, 176, 222, 1)'
    });
  }

  async init(){
    //首先加载高德地图
    const gaodeMap = await this.mapManager.createMap();
    this.map = gaodeMap;

    //高德地图加载完成，再加载 three.js 图层，注意这个顺序
    this.layer = new ThreeLayer({ map: this.map });
    await this.layer.init();

    //创建3D场景中的物品
    this.addMesh();
  }

  addMesh(){
    const axesHelper = new AxesHelper(15000);
    this.layer.scene.add(axesHelper);
  }
}