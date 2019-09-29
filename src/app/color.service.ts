import { Injectable } from '@angular/core';
import * as hljs from 'highlight.js';
import * as THREE from 'three';

@Injectable()
export class ColorService {
  loader;
  font;
  hljsSheetRef: CSSStyleSheet;
  hljsColors: ThreeJSColors;
  constructor() {
    this.loadhljsSheet();
  }
  colorize(atobFile): string {
    const fileArray = hljs.highlightAuto(atobFile).value.split(/\r\n|\r|\n/);
    let file = '';
    fileArray.forEach((fileLine, i) => file = file + '<span class="gpe-file-lines">' + i + '</span>' + fileLine + '\r');
    return file;
  }
  loadhljsSheet() {
    const sheets: any[] = Object.values(document.styleSheets);
    this.hljsSheetRef = sheets.find(sheet => sheet.href && sheet.href.includes('hljs'));
    if (this.hljsSheetRef) {
      this.hljsColors = new ThreeJSColors(this.hljsSheetRef);
    }
  }
  loadFont() {
    this.loader = new THREE.FontLoader();
    this.loader.load('assets/fonts/courier_prime_sans_regular.typeface.json', font => {
      this.font = font;
    });
  }
}

export class ThreeJSColors {
  background: string;
  constructor(hljsSheet) {
    const rules: any[] = Object.values(hljsSheet.rules);
    const hljsRule = rules.find(rule => rule.selectorText === '.hljs');
    this.background = hljsRule.style.background;
  }
}
