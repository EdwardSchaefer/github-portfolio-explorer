import * as THREE from 'three';
import {GUI} from 'three/examples/jsm/libs/dat.gui.module.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass';

export class GuiHelper {
  public gui;
  public effectController = {};
  public pass;
  public controls: GuiControl[];
  public changer = () => {
    this.controls.forEach(control => {
      // FIXME: aperture scale bug
      this.pass.uniforms[control.key].value = this.effectController[control.key] * (control.key !== 'aperture' ? 1.0 : 0.00001);
      // this.pass.uniforms[control.key].value = this.effectController[control.key];
    });
  };
  constructor(pass, controls: ControlsConfig[]) {
    this.gui = new GUI();
    this.pass = pass;
    this.controls = controls.map(control => {
      this.effectController[control.key] = control.init;
      return new GuiControl(this.gui, this.effectController, pass, control, this.changer);
    });
    this.gui.close();
    this.changer();
  }
}

export class GuiControl {
  public key: string;
  constructor(gui, effectController, pass, cv: ControlsConfig, changer) {
    this.key = cv.key;
    gui.add(effectController, cv.key, cv.min, cv.max, cv.increment).onChange(changer);
  }
}

export interface ControlsConfig {
  key: string;
  init: number;
  min: number;
  max: number;
  increment: number;
}

export class BokehPassHelper {
  public guiHelper: GuiHelper;
  constructor(scene, camera) {
    const controls: ControlsConfig[] = [
      {key: 'focus', init: 500.0, min: 10.0, max: 3000.0, increment: 10},
      {key: 'aperture', init: 5, min: 0, max: 10, increment: 0.1},
      {key: 'maxblur', init: 1.0, min: 0, max: 3.0, increment: 0.025}
    ];
    const passParams = {};
    controls.forEach(control => {
      passParams[control.key] = control.init;
    });
    this.guiHelper = new GuiHelper(new BokehPass(scene, camera, passParams), controls);
  }
}
