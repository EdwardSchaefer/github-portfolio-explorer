import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import {BlendFunction, KernelSize, BloomEffect, EffectPass} from 'postprocessing';

export class BloomPostProcessingHelper {
  composer;
  camera;
  effectA;
  effectPass;
  constructor(composer, camera) {
    this.composer = composer;
    this.camera = camera;
    const bloomOptions = {
      blendFunction: BlendFunction.SCREEN,
      kernelSize: KernelSize.MEDIUM,
      luminanceThreshold: 0.4,
      luminanceSmoothing: 0.1,
      height: 480
    };
    const bloomEffect = new BloomEffect(bloomOptions);
    this.effectA = bloomEffect;
    const effectPassA = new EffectPass(camera, bloomEffect);
    this.effectPass = effectPassA;
    effectPassA.renderToScreen = true;
    composer.addPass(effectPassA);
    const menu = new GUI();
    const blendModeA = this.effectA.blendMode;
    const params = {
      "resolution": this.effectA.resolution.height,
      "kernel size": this.effectA.blurPass.kernelSize,
      "blur scale": this.effectA.blurPass.scale,
      "intensity": this.effectA.intensity,
      "luminance": {
        "filter": this.effectA.luminancePass.enabled,
        "threshold": this.effectA.luminanceMaterial.threshold,
        "smoothing": this.effectA.luminanceMaterial.smoothing
      },
      "opacity": blendModeA.opacity.value,
      "blend mode": blendModeA.blendFunction
    };
    menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {
      this.effectA.resolution.height = Number(value);
    });
    menu.add(params, "kernel size", KernelSize).onChange((value) => {
      this.effectA.blurPass.kernelSize = Number(value);
    });
    menu.add(params, "blur scale").min(0.0).max(1.0).step(0.01).onChange((value) => {
      this.effectA.blurPass.scale = Number(value);
    });
    menu.add(params, "intensity").min(0.0).max(3.0).step(0.01).onChange((value) => {
      this.effectA.intensity = Number(value);
    });
    let folder = menu.addFolder("Luminance");
    folder.add(params.luminance, "filter").onChange((value) => {
      this.effectA.luminancePass.enabled  = value;
    });
    folder.add(params.luminance, "threshold").min(0.0).max(1.0).step(0.001).onChange((value) => {
      this.effectA.luminanceMaterial.threshold = Number(value);
    });
    folder.add(params.luminance, "smoothing").min(0.0).max(1.0).step(0.001).onChange((value) => {
      this.effectA.luminanceMaterial.smoothing = Number(value);
    });
    folder.open();
    folder = menu.addFolder("Selection");
    folder.open();
    menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {
      blendModeA.opacity.value  = value;
    });
    menu.add(params, "blend mode", BlendFunction).onChange((value) => {
      blendModeA.setBlendFunction(Number(value));
    });
  }
}
