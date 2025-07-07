import { AxesHelper, Color, DirectionalLight, HemisphereLight, MeshStandardMaterial, RepeatWrapping, TextureLoader } from "three";
import MapManager from "./MapManager";
import ThreeLayer from "./ThreeLayer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class GaoDeWorld1 {
  private mapManager: MapManager;
  private map: any;
  private layer: any;

  private offset = 0;
  private frameX;
  private mainModel;
  private trayModel;
  private waveTexture;

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

    //创建3D场景中的物品
    this.addMesh();
  }




















  //------------------------------------------------------------------------------------------------------
  addMesh(){
    this.createMainMesh();
    this.createTrayMesh();
    this.render();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    //本来这个renderer是要设置的，但是在threeLayer里面已经执行了，所以不需要再操作，
    //同理这里是混合图层，所以轨道控制器 controls 也不需要再设置了
    //this.renderer.render(this.scene, this.camera);
    //this.controls && this.controls.update();
    if(this.mainModel){
      this.mainModel.rotation.z += 0.05;
    }
    if(this.trayModel && this.waveTexture){
      this.offset += 0.8;
      this.waveTexture.offset.x = Math.floor(this.offset) / this.frameX;
    }
  }

   async createMainMesh() {
    const scene = this.layer.scene;
    //加载模型
    const model: any = await this.loadOneModel('../../../static/models/taper2.glb');
    const material = new MeshStandardMaterial({
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
    model.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
    const scaleSize = 100;
    model.scale.set(scaleSize, scaleSize, scaleSize);
    model.position.set(0, 0, 1);
    model.rotateZ(Math.PI / 4);
    this.mainModel = model;
    scene.add(model);
  }

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
  
  async createTrayMesh() {
    const model: any = await this.loadOneModel('../../../static/models/taper1-p.glb');
    const scaleSize = 100;
    model.scale.set(scaleSize, scaleSize, scaleSize);
    const loader = new TextureLoader();
    const texture = await loader.loadAsync('../../../static/images/wave.png');
    const { width, height } = texture.image;
    this.frameX = width / height;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    //设置xy方向重复次数，x轴有frameX帧，仅取一帧
    texture.repeat.set(1 / this.frameX, 1);
    const material = new MeshStandardMaterial({
      color: 0x1171ee,
      map: texture,
      transparent: true,
      opacity: 0.8,
      metalness: 0.0,
      roughness: 0.6,
      depthTest: true,
      depthWrite: false
    });
    model.material = material;
    this.waveTexture = texture;
    this.trayModel = model;
    const scene = this.layer.scene;
    scene.add(model);
  }
}