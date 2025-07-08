import { AxesHelper, BoxGeometry, Color, DirectionalLight, HemisphereLight, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, RepeatWrapping, TextureLoader } from "three";
import MapManager from "./MapManager";
import ThreeLayer from "./ThreeLayer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import axios from "axios";

export default class GaoDeWorld3 {
  private mapManager: MapManager;
  private map: any;
  private layer: any;

  private offset = 0;
  private frameX;
  private mainModel;
  private mainModelMaterial;
  private trayModel;
  private trayModelMaterial;
  private waveTexture;

  private dataList: any[] = [];

  private mainInstancedMesh;
  private trayInstancedMesh;

  //用于做定位和移动的介质
  private dummy = new Object3D();

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
    this.loadScript();
  }

  loadScript(){
    const script = document.createElement('script');
    script.onload = function () {
      //@ts-ignore
      var stats = new Stats();
      document.body.appendChild(stats.dom);
      requestAnimationFrame(function loop() {
        stats.update();
        requestAnimationFrame(loop);
      });
    };
    script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
  }

  async init(){
    //首先加载高德地图
    const gaodeMap = await this.mapManager.createMap();
    this.map = gaodeMap;

    //高德地图加载完成，再加载 three.js 图层，注意这个顺序
    this.layer = new ThreeLayer({ map: this.map });
    await this.layer.init();

    //添加辅助坐标、光照
    const scene = this.layer.scene;
    const axesHelper = new AxesHelper(15000);
    this.layer.scene.add(axesHelper);
    //模拟天空、底面的光照效果
    const hemiLight = new HemisphereLight(0xffffff, 0x8d8d8d, 2);
    hemiLight.position.set(100, 0, 0);
    scene.add(hemiLight);
    //添加平行光
    const dirLight = new DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(100, 10, 10);
    scene.add(dirLight);

    //加载并保存model
    await this.saveModels();

    //加载数据
    await this.fetchData();

    //加入实例化网格
    this.createInstancedMeshes();

    //监听相关的事件响应
    this.initEvent();
  }

  async saveModels(){
    //第1步， mainModel加载并保存
    this.mainModel = await this.loadOneModel('../../../static/models/taper2.glb');

    //第2步， mainModelMaterial生成并保存
    this.mainModelMaterial = new MeshStandardMaterial({
      //自身颜色
      color: 0x1171ee,
      //透明度
      transparent: true,
      opacity: 1,
      //金属性
      metalness: 0.0,
      //粗糙度
      roughness: 0.5,
      //发光颜色
      emissive: new Color(0xff0000), 
      emissiveIntensity: 0.2
    });

    //第3步， trayModel 加载并保存
    this.trayModel = await this.loadOneModel('../../../static/models/taper1-p.glb');

    //第4步，waveTexture 贴图加载并保存
    const loader = new TextureLoader();
    const texture = await loader.loadAsync('../../../static/images/wave.png');
    const { width, height } = texture.image;
    this.frameX = width / height;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    //设置xy方向重复次数，x轴有frameX帧，仅取一帧
    texture.repeat.set(1 / this.frameX, 1);
    this.waveTexture = texture;

    //第5步， trayModelMaterial 生成并保存
    this.trayModelMaterial = new MeshStandardMaterial({
      color: 0x1171ee,
      map: texture,
      transparent: true,
      opacity: 0.8,
      metalness: 0.0,
      roughness: 0.6,
      depthTest: true,
      depthWrite: false
    });
  }

  //加载外部模型
  loadOneModel(sourceUrl) {
    const loader = new GLTFLoader();
    return new Promise(resolve => {
      loader.load(sourceUrl, (gltf) => {
        const mesh = gltf.scene.children[0];
        resolve(mesh);
      },
      function (xhr) {
        console.log(xhr);
      },
      function (error) {
        console.log('loader model fail' + error);
      })
    })
  }

  //获取新的数据
  async fetchData(){
    const { data } = await axios.get(`/static/mock/cn.json`);
    if(data.data && data.data.length > 0){
        const list = data.data.map((item, index) => {
            const coords = this.map.customCoords.lngLatsToCoords([ [item.longitude, item.latitude] ]);
            return {
                lngLat: [item.longitude, item.latitude],
                modelId: 'warning',
                id: index,
                type: index % 4,
                name: item.stationName,
                scale: 10,
                coords: coords[0]
            }
        })
        this.dataList = list;
    }
  }

  //创建实例化网格
  createInstancedMeshes(){
    const scene = this.layer.scene;
    if(!scene){
      return;
    }
    const hasData = this.dataList && this.dataList.length > 0;
    if(!hasData){
      return;
    }
    const length = this.dataList.length;
    //首先，主模型创建一个实例化网格
    this.mainInstancedMesh = new InstancedMesh(this.mainModel.geometry, this.mainModelMaterial, length);
    this.initInstancedMesh(this.mainInstancedMesh);
    scene.add(this.mainInstancedMesh);
    this.mainInstancedMesh.attrs = { modelId: 'main' };
    //其次，底座模型创建一个实例化网格
    this.trayInstancedMesh = new InstancedMesh(this.trayModel.geometry, this.trayModelMaterial, length);
    this.initInstancedMesh(this.trayInstancedMesh);
    scene.add(this.trayInstancedMesh);
    this.trayInstancedMesh.attrs = { modelId: 'tray' };
  }

  //根据数据，填充实例化网格数据
  initInstancedMesh(instancedMesh) {
    for (let i = 0; i < this.dataList.length; i++) {
      //获得转换后的坐标
      const [x, y] = this.dataList[i].coords;
      //每个实例的尺寸
      const newSize = 20;
      this.dummy.scale.set(newSize, newSize, newSize);
      //更新每个实例的位置
      this.dummy.position.set(x, y, i);
      this.dummy.updateMatrix();
      //更新实例 变换矩阵
      instancedMesh.setMatrixAt(i, this.dummy.matrix);
      //设置实例 颜色 (这一步要考虑下，是否要在这里修改)
      //instancedMesh.setColorAt(i, new Color(0xff0000));
    }
    //强制更新实例
    instancedMesh.instanceMatrix.needsUpdate = true;
  }

  //监听相关的事件
  initEvent(){

  }
}