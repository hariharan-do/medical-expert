import * as THREE from 'three';
import gsap from 'gsap';

export class MedicalSceneManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.starPoints = null;
    this.gridHelper = null;
    this.animFrameId = null;
    this.isLowQuality = false;
    this.activeState = 'LANDING';

    this.init();
  }

  init() {
    // Pitch Black Manga Atmosphere
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050505, 0.04);

    const fov = 55;
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 11);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Stark Monochrome Lighting
    const ambientLight = new THREE.AmbientLight(0x262626, 2.5);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(10, 15, 10);

    const dirLight2 = new THREE.DirectionalLight(0x737373, 1.2);
    dirLight2.position.set(-10, -10, -5);

    this.scene.add(ambientLight, dirLight1, dirLight2);

    this.buildConstellation(1100);
    this.buildAmbientGrid();

    this.handleResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  buildConstellation(count = 1100) {
    if (this.starPoints) {
      this.disposeNode(this.starPoints);
    }

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const pureWhite = new THREE.Color(0xffffff);
    const silverGrey = new THREE.Color(0xd4d4d4);
    const darkGrey = new THREE.Color(0x525252);

    for (let i = 0; i < count; i++) {
      const radius = 12 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random() > 0.6 ? pureWhite : (Math.random() > 0.3 ? silverGrey : darkGrey);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.starPoints = new THREE.Points(geometry, material);
    this.scene.add(this.starPoints);
  }

  buildAmbientGrid() {
    const size = 60;
    const divisions = 40;
    this.gridHelper = new THREE.GridHelper(size, divisions, 0xffffff, 0x404040);
    this.gridHelper.position.y = -6;
    this.gridHelper.material.transparent = true;
    this.gridHelper.material.opacity = 0.15;
    this.scene.add(this.gridHelper);
  }

  disposeNode(node) {
    if (!node) return;

    node.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => this.disposeMaterial(mat));
        } else {
          this.disposeMaterial(child.material);
        }
      }
    });

    if (node.parent) {
      node.parent.remove(node);
    }
  }

  disposeMaterial(material) {
    if (!material) return;
    material.dispose();
    for (const key of Object.keys(material)) {
      const val = material[key];
      if (val && typeof val === 'object' && typeof val.dispose === 'function') {
        val.dispose();
      }
    }
  }

  setQualityMode(isLow) {
    if (this.isLowQuality === isLow) return;
    this.isLowQuality = isLow;

    if (isLow) {
      this.buildConstellation(400);
      if (this.renderer) this.renderer.setPixelRatio(1);
    } else {
      this.buildConstellation(1100);
      if (this.renderer) this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  transitionToState(newState) {
    this.activeState = newState;

    if (newState === 'LANDING') {
      gsap.to(this.camera.position, { x: 0, y: 0, z: 11, duration: 1.5, ease: 'power2.inOut' });
      gsap.to(this.camera.rotation, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power2.inOut' });
    } else if (newState === 'SYMPTOMS') {
      gsap.to(this.camera.position, { x: 0, y: -0.8, z: 13.5, duration: 1.5, ease: 'power2.inOut' });
    } else if (newState === 'DIAGNOSIS') {
      gsap.to(this.camera.position, { x: 1.2, y: 0.6, z: 8.0, duration: 1.6, ease: 'expo.inOut' });
      gsap.to(this.camera.rotation, { x: -0.04, y: 0.08, z: 0, duration: 1.6, ease: 'expo.inOut' });
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    const time = performance.now() * 0.001;

    if (this.starPoints) {
      this.starPoints.rotation.y = time * 0.012;
      this.starPoints.rotation.x = Math.sin(time * 0.008) * 0.008;
    }

    if (this.gridHelper) {
      this.gridHelper.position.z = (time * 0.15) % 1.5 - 6;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.handleResize);
    if (this.scene) this.scene.traverse((child) => this.disposeNode(child));
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}
