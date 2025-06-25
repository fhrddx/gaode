
type MapOption = {
  containerId: string,
  viewMode: string,
  showBuildingBlock: boolean,
  center: number[],
  zoom: number,
  mapStyle: string,
  skyColor: string
}

export default class MapManager {
  private readonly pluginsList = [
    //编辑多边形
    'AMap.PolyEditor',
    //允许开发者自定义图层的绘制方法
    'AMap.CustomLayer',
    //3D 控制条，旋转、缩放
    'AMap.ControlBar',
    //热力图
    'AMap.Heatmap',
    //3D图层
    'Map3D',
    //叠加自定义的WebGL内容
    'AMap.GLCustomLayer',
    //显示和管理建筑物信息
    'AMap.Buildings',
    //地图尺寸管理
    'AMap.Size',
    //经纬度坐标点
    'AMap.LngLat',
    //加载3D瓦片数据
    'AMap.3DTilesLayer',
    //编辑多边形和折线
    'AMap.PolylineEditor',
    //驾车路线规划
    'AMap.Driving'
  ];

  private config: MapOption;

  private map: any;
    
  constructor(option: MapOption){
    this.config = option;
  }

  public async createMap(){
    return new Promise((resolve, reject) => {
      this.loadGaoDeMapScript().then(() => {
        const containerId = this.config.containerId || 'container';
        //@ts-ignore
        const gaodeMap = new AMap.Map(containerId, {
          center: this.config.center,
          resizeEnable: true,
          zooms: [3, 22],
          viewMode: this.config.viewMode,
          defaultCursor: 'default',
          pitch: 30,
          mapStyle: this.config.mapStyle || 'amap://styles/grey',
          expandZoomRange: true,
          rotation: 0,
          zoom: this.config.zoom,
          skyColor: this.config.skyColor,
          //不显示默认建筑物
          showBuildingBlock: false,
          //不显示默认建筑物
          features: ['bg', 'road', 'point'], 
          
          //注意：这个Layer写与不写好像都是没有什么影响
          layers: [
            //@ts-ignore
            AMap.createDefaultLayer(),
            //@ts-ignore
            new AMap.Buildings({
              zooms: [10, 22],
              zIndex: 2,
              //修改该值会导致显示异常
              //heightFactor: 1.2, 
              roofColor: 'rgba(171,211,234,0.9)',
              wallColor: 'rgba(34,64,169,0.5)',
              opacity: 0.7,
              visible: this.config.showBuildingBlock
            })
          ],
          mask: null
        })
        this.map = gaodeMap;
        resolve(gaodeMap);
      })
      .catch((err) => {
        reject(err);
      })
    })
  }

  public getMap(){
    return this.map;
  }

  public destoryMap(){
    if(this.map){
      this.map.clearMap();
      this.map.destroy();
    }
  }

  //加载高德地图相关的js
  private async loadGaoDeMapScript(){
    const AMAP_KEY = '8281b6b8f40890205d2a2755b52dbfee';
    return new Promise((resolve, reject) => {
      //@ts-ignore
      if (window.AMap && window.Loca){
        //@ts-ignore
        resolve();
      }else{
        //加载maps.js
        const script = document.createElement('script');
        script.charset = 'utf-8'
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&callback=_mapLoaded&plugin=${this.pluginsList.join(',')}`;
        document.head.appendChild(script);
        script.onerror = function () {
          reject(new Error('地图API文件加载失败'));
        }
      }
      //@ts-ignore
      window._mapLoaded = function () {
        //加载loca.js
        const arr = [`https://webapi.amap.com/loca?v=2.0.0beta&key=${AMAP_KEY}`];
        let count = 0
        for (let i = 0; i < arr.length; i++) {
          const script = document.createElement('script');
          script.charset = 'utf-8';
          script.src = arr[i];
          document.head.appendChild(script);
          script.onload = function () {
            count = count + 1;
            if (count >= arr.length) {
              //@ts-ignore
              resolve();
            }
          }
          script.onerror = function () {
            reject(new Error('地图可视化API文件加载失败'));
          }
        }
      }
    })
  }
}