import {Component, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../data.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'gpe-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FileViewerComponent {
  public htmlData: any;
  constructor(public data: DataService, public sanitizer: DomSanitizer) {
    this.data.selectedFile.subscribe(file => {
      this.htmlData = this.sanitizer.bypassSecurityTrustHtml(file);
    });
  }
}
