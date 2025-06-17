import { AdditiveBlending, DoubleSide, GridHelper, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { IGeoWorld } from "../interfaces/IGeoWorld";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Sizes from "../Utils/Sizes";
import { Basic } from "../world/Basic";
import { Resources } from "../world/Resources";
import { FloorBg } from "./FloorBg";

export default class GeoWorld {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private sizes: Sizes;
  private resources: Resources;

  private floorBg: FloorBg;
  
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
      this.createMap(this.resources.textures.grid, this.resources.textures.gridBlack, this.resources.textures.bg);
    })
  }

  createMap(gridTexture, gridBlackTexture, bgTexture){
    const group = new Group();
    this.scene.add(group);

    const grid = new GridHelper(300, 18, 0x122839, 0x122839);
    grid.name = 'map_grid';
    grid.rotateX(Math.PI / 2);
    grid.translateY(-5);
    grid.renderOrder = 1;
    group.add(grid);

    const radius3 = 180;
    const plane3 = new PlaneGeometry(radius3, radius3);
    const material3 = new MeshBasicMaterial({
      map: bgTexture,
      color: 0x30dcff,
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const mesh3 = new Mesh(plane3, material3);
    mesh3.name = 'main_circle3';
    mesh3.translateZ(-3);
    mesh3.renderOrder = 4;
    group.add(mesh3);

    this.floorBg = new FloorBg({
      group: group,
      grid: gridTexture,
      gridBlack: gridBlackTexture,
    });
    this.floorBg.create();

    this.render();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.controls && this.controls.update();
    if(this.floorBg){
      this.floorBg.tick(false);
    }
  }
}