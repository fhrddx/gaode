import MapManager from "./MapManager";

export default class GaoDeWorld {
  private mapManager: MapManager;
  private map: any;
  private customerLayer: any;

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
    await this.createGaoDeMap();
  }

  async createGaoDeMap(){
    const gaodeMap = await this.mapManager.createMap();
    this.map = gaodeMap;
  }
}