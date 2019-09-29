import { Injectable } from '@angular/core';
import * as hljs from 'highlight.js';

@Injectable()
export class ColorService {
  hljsSheetRef: CSSStyleSheet;
  hljsColors: ThreeJSColors;
  constructor() {
    this.loadhljsSheet();
  }
  loadhljsSheet() {
    const sheets: any[] = Object.values(document.styleSheets);
    this.hljsSheetRef = sheets.find(sheet => sheet.href && sheet.href.includes('hljs'));
    if (this.hljsSheetRef) {
      this.hljsColors = new ThreeJSColors(this.hljsSheetRef);
    }
  }
  colorize(atobFile): string {
    const fileArray = hljs.highlightAuto(atobFile).value.split(/\r\n|\r|\n/);
    let file = '';
    fileArray.forEach((fileLine, i) => file = file + '<span class="gpe-file-lines">' + i + '</span>' + fileLine + '\r');
    return file;
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
