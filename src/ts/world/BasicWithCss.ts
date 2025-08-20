import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export class BasicWithCss {
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  public css3DRenderer: CSS3DRenderer;
  public controls: OrbitControls;

  constructor(dom: HTMLElement) {
    const containerHeight = dom.offsetHeight;
    const containerWidth = dom.offsetWidth;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(30, containerWidth / containerHeight, 1, 10000);
    this.camera.position.set(-450, 180, -600);
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.autoClear = true;
    dom.appendChild(this.renderer.domElement);
    this.css3DRenderer = new CSS3DRenderer();
    this.css3DRenderer.setSize(containerWidth, containerHeight);
    this.css3DRenderer.domElement.style.position = 'absolute';
    this.css3DRenderer.domElement.style.top = '0';
    this.css3DRenderer.domElement.style.left = '0';
    this.css3DRenderer.domElement.style.zIndex = '100';
    dom.appendChild(this.css3DRenderer.domElement);
    this.controls = new OrbitControls(this.camera, this.css3DRenderer.domElement);
    this.controls.autoRotateSpeed = 3;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 800;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI / 2;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.minAzimuthAngle = -Math.PI / 2;
    this.controls.maxAzimuthAngle = Math.PI / 2;
  }
}
