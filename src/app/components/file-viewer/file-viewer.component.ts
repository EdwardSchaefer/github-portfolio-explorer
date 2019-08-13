import {Component, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../data.service';
import {DomSanitizer} from '@angular/platform-browser';
import * as hljs from 'highlight.js';

@Component({
  selector: 'gpe-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: [
    './file-viewer.component.css',
    '../../../../node_modules/highlight.js/styles/monokai-sublime.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class FileViewerComponent {
  public htmlData: any;
  public lineCount: number;
  constructor(public data: DataService, public sanitizer: DomSanitizer) {
    this.data.readme.subscribe(a => {
      this.htmlData = this.sanitizer.bypassSecurityTrustHtml(a);
      if (data.file) {
        this.lineCount = this.data.file.split(/\r\n|\r|\n/).length;
      }
    });
  }
}
