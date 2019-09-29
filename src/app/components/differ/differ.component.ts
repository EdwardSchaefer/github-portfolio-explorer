import {Component, Input, OnChanges, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {DataService, FileResponse} from '../../data.service';
import {ColorService} from '../../color.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'gpe-differ',
  templateUrl: './differ.component.html',
  styleUrls: ['./differ.component.css']
})
export class DifferComponent implements OnChanges {
  @ViewChild('rendererContainer', { static: true }) rendererContainer: ElementRef;
  @Input('comparison') comparison;
  codeScreens: CodeScreen[];
  files: File[] = [];
  composer: EffectComposer;
  renderer: THREE.WebGLRenderer;
  camera;
  scene;
  initialized: boolean;
  constructor(public data: DataService, public color: ColorService) {
    this.codeScreens = [];
  }
  ngOnChanges() {
    this.loadResources();
    if (this.initialized && this.comparison) {
      const fileRequests = [];
      this.comparison.files.map(file => {
        const refName = file['contents_url'].split('?ref=')[1];
        fileRequests.push(this.data.getFile(file['filename'], refName));
      });
      forkJoin(fileRequests).subscribe((files: FileResponse[]) => {
        if (this.files.length) {this.files = []}
        files.forEach(file => {
          this.files.push(new File(file));
        });
        this.disposeScreens();
        const sample = this.files.find(file => ['.js', '.py', '.ts'].includes(file.extension)) || this.files[0];
        this.codeScreens.push(new CodeScreen(sample.slab, this.color.font, this.color.colorize));
        this.scene.add(this.codeScreens[0].textMesh);
      });
    }
  }
  initComposer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2500);
    this.camera.position.z = 900;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.color.hljsColors.background);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass( new RenderPass(this.scene, this.camera));
    // const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 0, 0);
    // bloomPass.threshold = 0;
    // bloomPass.strength = 1.5;
    // bloomPass.radius = 0.1;
    // this.composer.addPass(bloomPass);
    this.animate();
  }
  animate = () => {
    requestAnimationFrame(this.animate);
    this.codeScreens.forEach(codeScreen => codeScreen.textMesh.rotation.y += 0.001);
    this.composer.render();
  };
  loadResources() {
    if (!this.color.font) {
      this.color.loadFont();
    }
    if (!this.color.hljsSheetRef) {
      this.color.loadhljsSheet();
    }
    if (!this.initialized && this.color.font && this.color.hljsSheetRef) {
      this.initComposer();
      this.initialized = true;
    }
  }
  disposeScreens() {
    if (this.codeScreens.length) {
      this.codeScreens.forEach(codeScreen => codeScreen.dispose());
      this.codeScreens = [];
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
    }
  }
}

export class File {
  slab: string = '';
  fragments: string[];
  extension: string;
  constructor(file: FileResponse, patch?) {
    const fileNameFrags = file.filename.split('.');
    this.extension = '.' + fileNameFrags[fileNameFrags.length - 1];
    this.slab = file.data;
    // TODO: apply patch
    if (patch) {
      this.fragments = file.data.split(/\n/);
      this.fragments.map(frag => {
        this.slab = this.slab + frag.substring(1) + '\n';
      });
    }
  }
}

export class CodeScreen {
  material;
  geometry;
  color = 0x44ff88;
  textMesh;
  constructor(message, font, colorize) {
    this.material = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: false,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const shapes = font.generateShapes(message, 10, 1);
    this.geometry = new THREE.ShapeBufferGeometry(shapes);
    this.geometry.computeBoundingBox();
    // offset left column
    const xMid = this.geometry.boundingBox.min.x - this.geometry.boundingBox.max.x;
    const yMid = (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) / 2;
    this.geometry.translate(xMid, yMid, 0);
    this.textMesh = new THREE.Mesh(this.geometry, this.material);
    this.textMesh.position.z = -150;
  }
  dispose() {
    if (this.material) {this.material.dispose()}
    if (this.geometry) {this.geometry.dispose()}
  }
}
