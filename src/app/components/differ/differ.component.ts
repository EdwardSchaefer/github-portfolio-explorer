import {Component, Input, OnChanges, ViewChild, ElementRef, OnInit} from '@angular/core';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {DataService, FileResponse} from '../../data.service';
import {ColorService} from '../../color.service';
import {forkJoin} from 'rxjs';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {BokehPassHelper} from './gui';
import {fileRef} from 'src/app/components/differ/fileRef';

@Component({
  selector: 'gpe-differ',
  templateUrl: './differ.component.html',
  styleUrls: ['./differ.component.css']
})
export class DifferComponent implements OnChanges, OnInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer: ElementRef;
  @Input('comparison') comparison;
  codeScreens: CodeScreen[];
  files: File[] = [];
  composer: EffectComposer;
  renderer: THREE.WebGLRenderer;
  camera;
  controls;
  scene;
  initialized: boolean;
  scaling = 1;
  constructor(public data: DataService, public color: ColorService) {
    this.codeScreens = [];
  }
  ngOnInit() {
    this.color.loadFont();
    setTimeout(() => {
      this.color.loadhljsSheet();
      this.initComposer();
      this.fjCallback([fileRef]);
    }, 3000)
  }
  ngOnChanges() {
    // this.loadResources();
    // if (this.initialized && this.comparison) {
    //   const fileRequests = [];
    //   this.comparison.files.map(file => {
    //     const refName = file['contents_url'].split('?ref=')[1];
    //     fileRequests.push(this.data.getFile(file['filename'], refName));
    //   });
    //   forkJoin(fileRequests).subscribe((files: FileResponse[]) => {
    //     this.fjCallback(files);
    //   });
    // }
  }
  fjCallback(files) {
    if (this.files.length) {this.files = []}
    files.forEach(file => {
      this.files.push(new File(file));
    });
    this.disposeScreens();
    const sample = this.files.find(file => ['.js', '.py', '.ts'].includes(file.extension)) || this.files[0];
    this.codeScreens.push(new CodeScreen(sample.slab, this.color.font, this.color.lowlight, this.color.hljsColors, this.scaling, 1));
    this.scene.add(this.codeScreens[0].textMesh);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(0, 0, this.codeScreens[0].textMesh.position.z);
    this.controls.update();
  }
  initComposer() {
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, (this.scaling * 50));
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.color.hljsColors.background);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const helper = new BokehPassHelper(this.scene, this.camera);
    this.composer.addPass(helper.guiHelper.pass);
    // const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.1, 0);
    // this.composer.addPass(bloomPass);
    this.animate();
  }
  animate = () => {
    requestAnimationFrame(this.animate);
    // this.codeScreens.forEach(codeScreen => codeScreen.textMesh.rotation.y += 0.001);
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
  geometry;
  color = 0x44ff88;
  textMesh;
  lowlightMap: LowlightMap;
  constructor(message: string, font, lowlight, colors, scaling: number, shapeDetail?: number) {
    shapeDetail = shapeDetail || 12;
    const shapes = font.generateShapes(message, (scaling * 0.1), 1);
    this.geometry = new THREE.ShapeBufferGeometry(shapes, shapeDetail);
    this.geometry.computeBoundingBox();
    this.lowlightMap = new LowlightMap(this.geometry, colors, lowlight(message).value, font, scaling);
    // offset left column
    const xMid = this.geometry.boundingBox.min.x - this.geometry.boundingBox.max.x;
    const yMid = (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) / 2;
    this.geometry.translate(xMid, yMid, 0);
    this.textMesh = new THREE.Mesh(this.lowlightMap.geometry, this.lowlightMap.threeMats);
    this.textMesh.position.z = xMid - yMid;
  }
  dispose() {
    if (this.lowlightMap.threeMats.length) {this.lowlightMap.threeMats.forEach(mat => mat.dispose())}
    if (this.geometry) {this.geometry.dispose()}
    if (this.lowlightMap.geometry) {this.lowlightMap.geometry.dispose()}
  }
}

export class LowlightMap {
  geometry: any;
  materials: any[] = [];
  colorLengths: any[] = [];
  llMap = (children: any[], classname: string, font: any, scaling: number) => {
    children.forEach(child => {
      if (child.type === 'text') {
        const groupLength = font.generateShapes(child.value, (scaling * 10), 1).length;
        this.colorLengths.push({groupLength: groupLength, className: classname});
      } else {
        this.llMap(child.children, child.properties.className[0], font, scaling);
      }
    });
  };
  constructor(geometry, colors, llResult, font, scaling) {
    this.geometry = geometry;
    this.llMap(llResult, 'hljs', font, scaling);
    let currentIndex = 0;
    this.colorLengths.forEach(cl => {
      if (this.materials.map(material => material.hljsName).includes(cl.className)) {
        for (let i = 0; i < cl.groupLength; i++) {
          this.geometry.groups[currentIndex].materialIndex = this.materials.findIndex(material => material.hljsName === cl.className);
          currentIndex++;
        }
      } else {
        console.log(colors);
        this.materials.push({
          hljsName: cl.className,
          threeMat: new THREE.MeshBasicMaterial({
            color: colors.rules['.' + cl.className] || 0xff0000,
            transparent: false,
            side: THREE.DoubleSide
          })
        });
        for (let i = 0; i < cl.groupLength; i++) {
          this.geometry.groups[currentIndex].materialIndex = this.materials.length - 1;
          currentIndex++;
        }
      }
    });
  }
  get threeMats() {
    return this.materials.map(material => material.threeMat);
  }
}
