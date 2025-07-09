import { AxesHelper, BoxGeometry, Color, DirectionalLight, HemisphereLight, InstancedMesh, Intersection, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Raycaster, RepeatWrapping, TextureLoader, Vector2 } from "three";
import MapManager from "./MapManager";
import ThreeLayer from "./ThreeLayer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import axios from "axios";

export default class GaoDeWorld5 {
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

  private dummy = new Object3D();

  private defaultSize = 20;
  private defaultResolution;

  //hover与click相关
  private tooltip = document.getElementById('tooltip') as HTMLElement
  private raycaster: Raycaster;
  private mouse: Vector2;
  private currentHoverMesh: Intersection | undefined;
  private clickRaycaster: Raycaster;
  private startClientX: number;
  private startClientY: number;
  private requestAnimationFrameId: number = 0;
  private currentInstanceId: number = -1;

  //高亮和动画相关的配置
  private currentAngle: number = 0;
  private maxAngle: number = Math.PI * 2;

  constructor(containerId: string){
    this.mouse = new Vector2(0, 0);
    this.raycaster = new Raycaster();
    this.clickRaycaster = new Raycaster();
    this.startClientX = 0;
    this.startClientY = 0;

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

  //实例化所有的功能
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

    //逐帧处理
    this.render();
  }

  //加载并保存model
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
          scale: 1,
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
      const newSize = this.defaultSize;
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
    if(!this.map){
      return;
    }
    //第一次加载，参考这个缩放参数， 后面的size会根据这个等比例调整
    this.defaultResolution = this.getResolution();
    //添加缩放监听事件
    this.handelViewChange = this.handelViewChange.bind(this);
    this.map.on('zoomchange', this.handelViewChange);
    //处理下mousemove事件
    this.mouseMoveEvent();
  }

  //处理下缩放变化
  handelViewChange () {
    this.updateSizeByResolution();
  }

  //改变下实例化网格的尺寸
  updateSizeByResolution(){
    //获取最新的缩放尺寸
    const newResolution = this.getResolution();
    //根据首次加载的尺寸，计算出新的尺寸
    const newSize = newResolution * this.defaultSize / this.defaultResolution;
    //改变两个实例化网格的尺寸
    for (let i = 0; i < this.dataList.length; i++) {
      const item = this.dataList[i];
      const [x, y] = item.coords;
      //变换主体
      this.updateMatrixAt(this.mainInstancedMesh, {
        size: newSize,
        position: [x, y, 0],
        rotation: [0, 0, 0]
      }, i);
      //变换下底盘的尺寸、位置、颜色
      this.updateMatrixAt(this.trayInstancedMesh, {
        size: newSize,
        position: [x, y, 0],
        rotation: [0, 0, 0]
      }, i);
    }
    //这里要设置为可更新，否则不生效
    if(this.mainInstancedMesh.instanceMatrix){
      this.mainInstancedMesh.instanceMatrix.needsUpdate = true;
      this.trayInstancedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  /**
   * @description 更新指定网格体的单个示例的变化矩阵
   * @param {instancedMesh} Mesh 网格体
   * @param {Object} transform 变化设置，比如{size:1, position:[0,0,0], rotation:[0,0,0]}
   * @param {Number} index 网格体实例索引值
   */
  updateMatrixAt (mesh, transform, index) {
    if (!mesh) {
      return;
    }
    const { size, position, rotation } = transform;
    const { dummy } = this;
    //1、更新尺寸
    dummy.scale.set(size, size, size);
    //2、更新位置
    dummy.position.set(position[0], position[1], position[2]);
    //3、更新旋转角度
    dummy.rotation.x = rotation[0];
    dummy.rotation.y = rotation[1];
    dummy.rotation.z = rotation[2];
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }

  //获取高德地图的缩放程度
  getResolution () {
    if (typeof this.map.getResolution === 'function') {
      return this.map.getResolution();
    } else {
      return null;
    }
  }

  //光标移动事件
  mouseMoveEvent(){
    if(this.layer.container){
      //下面这个container有几种写法，需要对比下哪一种比较合适：this.layer.container 、 document.getElementById('earth-canvas') as HTMLElement 、 this.map.getContainer()
      const container = this.layer.container;
      container.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const { left, top } = container.getBoundingClientRect();
        this.mouse.x = ((x - left) / container.offsetWidth) * 2 - 1;
        this.mouse.y = -((y - top) / container.offsetHeight) * 2 + 1;
        this.tooltip.style.left = e.clientX - left + 20 + 'px';
        this.tooltip.style.top = e.clientY - top + 5 + 'px';
      })
      //下面这两个事件，联合起来，判断点击事件
      container.addEventListener('mousedown', (e) => {
        this.startClientX = e.clientX;
        this.startClientY = e.clientY;
      });
      container.addEventListener('mouseup', (e) => {
        const distant =
          Math.abs(e.clientX - this.startClientX) + Math.abs(e.clientY - this.startClientY);
        if (distant > 2) {
          return;
        }
        const { left, top } = container.getBoundingClientRect();
        const x = ((e.clientX - left) / container.offsetWidth) * 2 - 1;
        const y = -((e.clientY - top) / container.offsetHeight) * 2 + 1;
        this.click(x, y);
      });
    }
  }

  //逐帧变动
  render(){
    this.requestAnimationFrameId = requestAnimationFrame(this.render.bind(this));
    this.raycasterEvent();
    //更新下动画
    this.currentAngle = (this.currentAngle + 0.05) % this.maxAngle;

  }

  //射线拾取
  raycasterEvent(){
    if (this.mouse.x === 0 && this.mouse.y === 0) {
      return;
    }
    const { camera, scene } = this.layer;
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(scene.children, true);
    const intersectsHasData = intersects && intersects.length > 0;
    if(!intersectsHasData){
      this.mouse.x = 0;
      this.mouse.y = 0;
      this.currentInstanceId = -1;
      this.tooltip.style.visibility = 'hidden';
      this.tooltip.innerHTML = '';
      return;
    }
    const instancedMesh = intersects[0].object;
    //@ts-ignore
    if(!instancedMesh?.isInstancedMesh){
      this.mouse.x = 0;
      this.mouse.y = 0;
      this.currentInstanceId = -1;
      this.tooltip.style.visibility = 'hidden';
      this.tooltip.innerHTML = '';
      return;
    }
    const intersection = this.raycaster.intersectObject(instancedMesh, false);
    const hasChindren = intersection && intersection.length > 0;
    if(!hasChindren){
      this.mouse.x = 0;
      this.mouse.y = 0;
      this.currentInstanceId = -1;
      this.tooltip.style.visibility = 'hidden';
      this.tooltip.innerHTML = '';
      return;
    }
    //获取目标序号
    const { instanceId } = intersection[0];
    if(this.currentInstanceId === instanceId){
      return;
    }
    this.currentInstanceId = instanceId;
    this.tooltip.style.visibility = 'visible';
    this.tooltip.innerHTML = this.dataList[instanceId].name;
    this.mouse.x = 0;
    this.mouse.y = 0;
  }

  //响应点击事件
  click(x: number, y: number){
    const { camera, scene } = this.layer;
    const position = new Vector2(x, y);
    this.raycaster.setFromCamera(position, camera);
    const intersects = this.raycaster.intersectObjects(scene.children, true);
    const intersectsHasData = intersects && intersects.length > 0;
    if(!intersectsHasData){
      return;
    }
    const instancedMesh = intersects[0].object;
    //@ts-ignore
    if(!instancedMesh?.isInstancedMesh){
      return;
    }
    const intersection = this.raycaster.intersectObject(instancedMesh, false);
    const hasChindren = intersection && intersection.length > 0;
    if(!hasChindren){
      return;
    }
    //获取目标序号
    const { instanceId } = intersection[0];
    const item = this.dataList[instanceId];
    const msg = `你点击的编号是：${instanceId}, 站点是：${item.name}`;
    alert(msg);
  }
}