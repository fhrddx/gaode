import { AdditiveBlending, AmbientLight, AxesHelper, CatmullRomCurve3, DirectionalLight, DoubleSide, GridHelper, Group, HemisphereLight, LineCurve3, Mesh, MeshBasicMaterial, PerspectiveCamera, RepeatWrapping, Scene, TubeGeometry, Vector3, WebGLRenderer } from "three";
import { IGeoWorld } from "../interfaces/IGeoWorld";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Sizes from "../Utils/Sizes";
import { Basic } from "../world/Basic";
import { Resources } from "../world/Resources";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class FactoryWorld {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private sizes: Sizes;
  private resources: Resources;
  
  constructor(option: IGeoWorld) {
    const basic = new Basic(option.dom);
    this.scene = basic.scene;
    this.camera = basic.camera;
    this.camera.position.set(0, -300, 200);
    this.renderer = basic.renderer;
    this.controls = basic.controls;

    this.sizes = new Sizes({ dom: option.dom })
    this.sizes.$on('resize', () => {
      this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height));
      this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height);
      this.camera.updateProjectionMatrix();
    })

    this.resources = new Resources(async () => {
      this.buildScene();
      console.log(this.resources !== null);
    })
  }

  buildScene(){
    const axesHelper = new AxesHelper(1500);
    this.scene.add(axesHelper);

    const grid = new GridHelper(300, 18, 0x122839, 0x122839);
    grid.rotateX(Math.PI / 2);
    grid.translateY(-5);
    this.scene.add(grid);

    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.position.set(500, 0, 500);
    this.scene.add(dirLight);

    const dirLight2 = new DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-100, -300, 300);
    this.scene.add(dirLight2);

    this.addModels();
    this.render();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.controls && this.controls.update();
  }

  async addModels(){
    const group = new Group();
    //电塔
    const tower = await this.createElectricTower();
    group.add(tower);
    //箱变
    const xiangbian = await this.createXiangbian();
    group.add(xiangbian);
    //逆变器
    const batteryGroup = await this.createBattery();
    group.add(batteryGroup);
    //光伏板
    const panels = await this.createPanels();
    group.add(panels);
    //流动线条
    const lineGroup = this.createOutLine();
    group.add(lineGroup);
    //加上所有的物品
    this.scene.add(group);
    //估计是倾斜40度能达到设计稿的效果
    group.rotateZ(-40 * Math.PI /180);
  }

  //电塔
  async createElectricTower() {
    const model: any = await this.loadOneModel('../../../static/models/factory/grid01.glb');
    const size = 18;
    model.scale.set(size, size, size);
    model.position.set(50, 40, 12.5);
    model.rotateX(Math.PI / 2);
    return model;
  }

  //箱变
  async createXiangbian() {
    const model: any = await this.loadOneModel('../../../static/models/factory/xb.glb');
    model.scale.set(0.01, 0.01, 0.01);
    model.position.set(48, -20, -20);
    model.rotateY(-Math.PI / 2);
    model.translateZ(-20);
    return model;
  }

  //逆变器
  async createBattery(){
    const group = new Group();

    const model: any = await this.loadOneModel('../../../static/models/factory/sigenstackn.glb');
    const modelAfter: any = model.clone();

    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(0, -20, 14);
    model.rotateX(Math.PI / 2);
    group.add(model);

    modelAfter.scale.set(0.1, 0.1, 0.1);
    modelAfter.position.set(0, 25, 14);
    modelAfter.rotateX(Math.PI / 2);
    modelAfter.rotateZ(-Math.PI);
    group.add(modelAfter);

    const stackModel: any = await this.loadOneModel('../../../static/models/factory/sigenstackb.glb');
    const stackModelClone = stackModel.clone();

    stackModel.scale.set(0.1, 0.1, 0.1);
    stackModel.position.set(-3, -4, 11.5);
    stackModel.rotateY(-Math.PI / 2);
    group.add(stackModel);

    stackModelClone.scale.set(0.1, 0.1, 0.1);
    stackModelClone.position.set(3, 9.8, 11.5);
    stackModelClone.rotateY(-1 * Math.PI / 2);
    stackModelClone.rotateZ(Math.PI);
    group.add(stackModelClone);

    return group;
  }

  //光伏板
  async createPanels(){
    const group = new Group();

    const model: any = await this.loadOneModel('../../../static/models/factory/pannel.glb');
    const size = 15;
    const height = 7;
    const left = -40;
    model.scale.set(size, size, size);
    model.position.set(left, -30, height);
    model.rotateX(Math.PI / 2);
    group.add(model);

    const model1 = model.clone();
    model1.position.set(left, -17, height);
    group.add(model1);

    const model2 = model.clone();
    model2.position.set(left, -4, height);
    group.add(model2);

    const model3 = model.clone();
    model3.position.set(left, 9, height);
    group.add(model3);

    const model4 = model.clone();
    model4.position.set(left, 22, height);
    group.add(model4);

    const model5 = model.clone();
    model5.position.set(left, 35, height);
    group.add(model5);

    return group;
  }

  //创建线条
  public createOutLine() {
    const group = new Group();

    const material = new MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      blending: AdditiveBlending,
      side: DoubleSide,
    });

    const curve1 = new CatmullRomCurve3([
      new Vector3(-1, -20, 0),
      new Vector3(-1, -40, 0),
      new Vector3(-1.01, -40, 0),
      new Vector3(-40, -40, 0),
      new Vector3(-40, -39.99, 0),
      new Vector3(-40, -30, 0)
    ], false);
    const tubeGeometry1 = new TubeGeometry(curve1, 256 * 10, 0.3, 5, false);
    const line1 = new Mesh(tubeGeometry1, material);
    group.add(line1);

    const curve2 = new CatmullRomCurve3([
      new Vector3(1, -20, 0),
      new Vector3(1, -40, 0),
      new Vector3(1.01, -40, 0),
      new Vector3(48, -40, 0),
      new Vector3(48, -39.99, 0),
      new Vector3(48, -30, 0)
    ], false);
    const tubeGeometry2 = new TubeGeometry(curve2, 256 * 10, 0.3, 5, false);
    const line2 = new Mesh(tubeGeometry2, material);
    group.add(line2);

    const curve3 = new CatmullRomCurve3([
      new Vector3(48, -2, 0),
      new Vector3(48, 40, 0),
    ], false);
    const tubeGeometry3 = new TubeGeometry(curve3, 256 * 10, 0.3, 5, false);
    const line3 = new Mesh(tubeGeometry3, material);
    group.add(line3);

    const curve4 = new CatmullRomCurve3([
      new Vector3(-40, 35, 0),
      new Vector3(-40, 44.9, 0),
      new Vector3(-40, 45, 0),
      new Vector3(0, 45, 0),
      new Vector3(0, 44.9, 0),
      new Vector3(0, 25, 0),
    ], false);
    const tubeGeometry4 = new TubeGeometry(curve4, 256 * 10, 0.3, 5, false);
    const line4 = new Mesh(tubeGeometry4, material);
    group.add(line4);

    return group;
  }
  
  //加载3d模型
  loadOneModel(sourceUrl) {
    const loader = new GLTFLoader();
    return new Promise(resolve => {
      loader.load(sourceUrl, (gltf) => {
        const mesh = gltf.scene.children[0];
        const size = 100;
        mesh.scale.set(size, size, size);
        this.scene.add(mesh);
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
}