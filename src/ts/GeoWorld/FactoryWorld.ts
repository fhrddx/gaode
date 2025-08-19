import { AxesHelper, Color, DirectionalLight, GridHelper, Group, HemisphereLight, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
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
    this.camera.position.set(0, -200, 250);
    this.renderer = basic.renderer;
    this.controls = basic.controls;

    this.sizes = new Sizes({ dom: option.dom })
    this.sizes.$on('resize', () => {
      this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height));
      this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height);
      this.camera.updateProjectionMatrix();
    })

    this.resources = new Resources(async () => {
      this.createMap();
    })
  }

  createMap(){
    const hemiLight = new HemisphereLight(0xffffff, 0x8d8d8d, 2);
    hemiLight.position.set(100, 0, 0);
    this.scene.add(hemiLight);

    const dirLight = new DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(100, 10, 10);
    this.scene.add(dirLight);

    const axesHelper = new AxesHelper(1500)
    this.scene.add(axesHelper);

    this.createMainMesh();
    this.createMainMesh1();
    this.createMainMesh2();
    this.createMainMesh3();

    const group = new Group();
    this.scene.add(group);

    const grid = new GridHelper(300, 18, 0x122839, 0x122839);
    grid.name = 'map_grid';
    grid.rotateX(Math.PI / 2);
    grid.translateY(-5);
    grid.renderOrder = 1;
    group.add(grid);

    this.render();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.controls && this.controls.update();
  }

  //ok
  async createMainMesh() {
    //加载模型
    const model: any = await this.loadOneModel('../../../static/models/factory/grid01.glb');
    //给模型换一种材质
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
      //emissive: new Color('#666666'), 
      //emissiveIntensity: 0.2,
      //blending: THREE.AdditiveBlending
    });
    //model.material = material;
    model.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
    model.scale.set(20, 20, 20);
    model.position.set(80, 60, 0);
    model.rotateX(Math.PI / 2);
    model.translateZ(-15);
    this.scene.add(model);
  }

  async createMainMesh1() {
    //加载模型
    const model: any = await this.loadOneModel('../../../static/models/factory/sigenstackn.glb');
    //给模型换一种材质
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
      //emissive: new Color('#666666'), 
      //emissiveIntensity: 0.2,
      //blending: THREE.AdditiveBlending
    });
    //model.material = material;
    model.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(10, 10, 10);
    //model.rotateX(Math.PI / 2);
    //model.translateZ(-15);
    this.scene.add(model);
  }



  async createMainMesh2() {
    //加载模型
    const model: any = await this.loadOneModel('../../../static/models/factory/sigenstackb.glb');
    //给模型换一种材质
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
      //emissive: new Color('#666666'), 
      //emissiveIntensity: 0.2,
      //blending: THREE.AdditiveBlending
    });
    //model.material = material;
    model.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(0, 0, 0);
    //model.rotateX(Math.PI / 2);
    //model.translateZ(-15);
    this.scene.add(model);
  }



  //ok
  async createMainMesh3() {
    //加载模型
    const model: any = await this.loadOneModel('../../../static/models/factory/xb.glb');
    //给模型换一种材质
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
      //emissive: new Color('#666666'), 
      //emissiveIntensity: 0.2,
      //blending: THREE.AdditiveBlending
    });
    //model.material = material;
    model.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
    model.scale.set(0.01, 0.01, 0.01);
    model.position.set(80, -20, -20);
    model.rotateY(-Math.PI / 2);
    model.translateZ(-20);
    this.scene.add(model);
  }





  loadOneModel(sourceUrl) {
    const loader = new GLTFLoader();
    return new Promise(resolve => {
      loader.load(sourceUrl, (gltf) => {
        //获取模型
        const mesh = gltf.scene.children[0];
        //放大模型以便观察
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