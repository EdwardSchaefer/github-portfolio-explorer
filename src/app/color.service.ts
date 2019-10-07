import { Injectable } from '@angular/core';
import * as hljs from 'highlight.js';
import * as low from 'lowlight';
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
  lowlight(atobFile) {
    return low.highlightAuto(atobFile);
  }
  highlight(atobFile): string {
    return hljs.highlightAuto(atobFile).value;
  }
  addLines(file): string {
    const fileArray = file.split(/\r\n|\r|\n/);
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
  rules: {} = {};
  constructor(hljsSheet) {
    const rules: any[] = Object.values(hljsSheet.rules);
    const backgroundRule = rules.find(rule => rule.selectorText === '.hljs');
    this.background = backgroundRule.style.background;
    rules.forEach(rule => {
      if (Object.values(rule.style).includes('color')) {
        rule.selectorText.split(', ').forEach(selector => {
          this.rules[selector] = rule.style.color;
        });
      }
    });
  }
}
