import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import {BlendFunction, KernelSize, DepthOfFieldEffect, ScanlineEffect, EffectPass, BloomEffect, TextureEffect, VignetteEffect, DepthEffect, SMAAEffect} from 'postprocessing';

export class DofPostProcessingHelper {
  composer;
  camera;
  smaaPass;
  effectPass;
  depthEffect;
  vignetteEffect;
  depthOfFieldEffect;
  cocTextureEffect;
  dofPass;
  constructor(composer, camera) {
    this.composer = composer;
    this.camera = camera;
    // const smaaEffect = new SMAAEffect(
    //   assets.get("smaa-search"),
    //   assets.get("smaa-area"),
    //   SMAAPreset.HIGH,
    //   EdgeDetectionMode.DEPTH
    // );
    // smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);
    this.depthOfFieldEffect = new DepthOfFieldEffect(camera, {
      focusDistance: 0.0,
      focalLength: 0.048,
      bokehScale: 2.0,
      height: 480
    });
    this.depthEffect = new DepthEffect({
      blendFunction: BlendFunction.SKIP
    });
    this.vignetteEffect = new VignetteEffect({
      eskil: false,
      offset: 0.35,
      darkness: 0
    });
    this.cocTextureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: this.depthOfFieldEffect.renderTargetCoC.texture
    });
    // const bloomOptions = {
    //   blendFunction: BlendFunction.SCREEN,
    //   kernelSize: KernelSize.HUGE,
    //   luminanceThreshold: 0.25,
    //   luminanceSmoothing: 0.25,
    //   height: 1080,
    //   intensity: 3
    // };
    // const bloomEffect = new BloomEffect(bloomOptions);
    // const bloomPass = new EffectPass(this.camera, bloomEffect);
    const dofOptions = {
      kernelSize: KernelSize.SMALL,
      focusDistance: 0.2,
      focalLength: 0.025,
      bokehScale: 5.0,
      height: 1080
    }
    this.depthOfFieldEffect = new DepthOfFieldEffect(this.camera, dofOptions);
    this.dofPass = new EffectPass(this.camera, this.depthOfFieldEffect);
    // const scanlineEffect = new ScanlineEffect({
    //   blendFunction: BlendFunction.DARKEN,
    //   density: 2,
    //   opacity: 0.1
    // });
    // const scanlinePass = new EffectPass(this.camera, scanlineEffect);
    // this.composer.addPass(effectPass);
    // this.composer.addPass(smaaPass);
    // this.composer.addPass(bloomPass);
    // this.composer.addPass(scanlinePass);
    this.effectPass = new EffectPass(camera, this.depthOfFieldEffect, this.vignetteEffect, this.cocTextureEffect, this.depthEffect);
    this.smaaPass = new EffectPass(camera);
    const menu = new GUI();
    const cocMaterial = this.depthOfFieldEffect.circleOfConfusionMaterial;
    const blendMode = this.depthOfFieldEffect.blendMode;
    const RenderMode = {
      DEFAULT: 0,
      DEPTH: 1,
      COC: 2
    };
    const params = {
      "coc": {
        "edge blur kernel": this.depthOfFieldEffect.blurPass.kernelSize,
        "focus": cocMaterial.uniforms.focusDistance.value,
        "focal length": cocMaterial.uniforms.focalLength.value
      },
      "vignette": {
        "enabled": true,
        "offset": this.vignetteEffect.uniforms.get("offset").value,
        "darkness": this.vignetteEffect.uniforms.get("darkness").value
      },
      "render mode": RenderMode.DEFAULT,
      "resolution": this.depthOfFieldEffect.resolution.height,
      "bokeh scale": this.depthOfFieldEffect.bokehScale,
      "opacity": blendMode.opacity.value,
      "blend mode": blendMode.blendFunction
    };
    const toggleRenderMode = () => {
      const mode = Number(params["render mode"]);
      this.depthEffect.blendMode.setBlendFunction((mode === RenderMode.DEPTH) ? BlendFunction.NORMAL : BlendFunction.SKIP);
      this.cocTextureEffect.blendMode.setBlendFunction((mode === RenderMode.COC) ? BlendFunction.NORMAL : BlendFunction.SKIP);
      this.vignetteEffect.blendMode.setBlendFunction((mode === RenderMode.DEFAULT && params.vignette.enabled) ? BlendFunction.NORMAL : BlendFunction.SKIP);
      this.smaaPass.enabled = (mode === RenderMode.DEFAULT);
      this.effectPass.encodeOutput = (mode === RenderMode.DEFAULT);
      this.effectPass.renderToScreen = (mode !== RenderMode.DEFAULT);
    }
    menu.add(params, "render mode", RenderMode).onChange(toggleRenderMode);
    menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {
      this.depthOfFieldEffect.resolution.height = Number(value);
    });
    menu.add(params, "bokeh scale").min(1.0).max(5.0).step(0.001).onChange((value) => {
      this.depthOfFieldEffect.bokehScale = value;
    });
    let folder = menu.addFolder("Circle of Confusion");
    folder.add(params.coc, "edge blur kernel", KernelSize).onChange((value) => {
      this.depthOfFieldEffect.blurPass.kernelSize = Number(value);
    });
    folder.add(params.coc, "focus").min(0.0).max(1.0).step(0.001).onChange((value) => {
      cocMaterial.uniforms.focusDistance.value = value;
    });
    folder.add(params.coc, "focal length").min(0.0).max(1.0).step(0.0001).onChange((value) => {
      cocMaterial.uniforms.focalLength.value = value;
    });
    folder.open();
    folder = menu.addFolder("Vignette");
    folder.add(params.vignette, "enabled").onChange((value) => {
      this.vignetteEffect.blendMode.setBlendFunction(value ? BlendFunction.NORMAL : BlendFunction.SKIP);
    });
    folder.add(this.vignetteEffect, "eskil");
    folder.add(params.vignette, "offset").min(0.0).max(1.0).step(0.001).onChange((value) => {
      this.vignetteEffect.uniforms.get("offset").value = value;
    });
    folder.add(params.vignette, "darkness").min(0.0).max(1.0).step(0.001).onChange((value) => {
      this.vignetteEffect.uniforms.get("darkness").value = value;
    });
    menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {
      blendMode.opacity.value = value;
    });
    menu.add(params, "blend mode", BlendFunction).onChange((value) => {
      blendMode.setBlendFunction(Number(value));
    });
  }
}
