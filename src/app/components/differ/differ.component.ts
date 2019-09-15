import {Component, Input, OnChanges, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';

@Component({
  selector: 'gpe-differ',
  templateUrl: './differ.component.html',
  styleUrls: ['./differ.component.css']
})
export class DifferComponent implements OnChanges, AfterViewInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer: ElementRef;
  @Input('comparison') comparison;
  files: File[] = [];
  composer: EffectComposer;
  renderer: THREE.WebGLRenderer;
  loader;
  text;
  camera;
  scene;
  light;
  constructor() { }

  ngOnChanges() {
    if (this.comparison) {
      this.comparison.files.map(file => {
        this.files.push(new File(file));
      });
      this.loadText(this.files[0].slab);
    }
  }

  ngAfterViewInit() {

  }

  loadText(message) {
    const that = this;
    this.loader = new THREE.FontLoader();
    this.loader.load('assets/fonts/courier_prime_sans_regular.typeface.json', function (font) {
      const color = 0x44ff88;
      const matLite = new THREE.MeshBasicMaterial({
        color: color,
        transparent: false,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const shapes = font.generateShapes(message, 10, 1);
      const geometry = new THREE.ShapeBufferGeometry(shapes);
      geometry.computeBoundingBox();
      // offset left column
      const xMid = geometry.boundingBox.min.x - geometry.boundingBox.max.x;
      const yMid = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
      geometry.translate(xMid, yMid, 0);
      that.initComposer(new THREE.Mesh(geometry, matLite));
    });
  }

  initComposer(textMesh) {
    this.text = textMesh;
    this.text.position.z = -150;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2500);
    this.camera.position.z = 900;
    this.scene = new THREE.Scene();
    this.scene.add(this.text);
    this.scene.add(new THREE.AmbientLight( 0x404040));
    this.scene.add(new THREE.AmbientLight( 0x222222));
    this.light = new THREE.DirectionalLight( 0xffffff);
    this.light.position.set(1, 1, 1);
    this.scene.add(this.light);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass( new RenderPass(this.scene, this.camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 0, 0);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.1;
    this.composer.addPass(bloomPass);
    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.text.rotation.y += 0.001;
    this.composer.render();
  }
}

export class File {
  slab: string = '';
  fragments: string[];
  constructor(fileData) {
    if (fileData['patch']) {
      this.fragments = fileData['patch'].split(/\n/);
      this.fragments.map(frag => {
        this.slab = this.slab + frag.substring(1) + '\n';
      });
    }
  }
}

