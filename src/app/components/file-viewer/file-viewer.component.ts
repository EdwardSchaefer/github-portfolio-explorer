import {Component, OnChanges, OnInit} from '@angular/core';
import {DataService} from '../../data.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'gpe-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.css']
})
export class FileViewerComponent {
  public htmlData: any;
  constructor(public data: DataService, public sanitizer: DomSanitizer) {
    this.data.readme.subscribe(a => {
      this.htmlData = this.sanitizer.bypassSecurityTrustHtml(a);
    });
  }
}
