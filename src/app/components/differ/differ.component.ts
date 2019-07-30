import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'gpe-differ',
  templateUrl: './differ.component.html',
  styleUrls: ['./differ.component.css']
})
export class DifferComponent implements OnChanges {
  @Input('comparison') comparison;
  files: File[] = [];
  constructor() { }

  ngOnChanges() {
    if (this.comparison) {
      this.comparison.files.map(file => {
        this.files.push(new File(file));
      });
      console.log(this.files);
    }
  }
}

export class File {
  fragments;
  constructor(fileData) {
    this.fragments = fileData['patch'].split(/\n/);
    // frags.push(file['patch'].split(/\r\n|\r|\n/));
    // frags.push(file['patch'].split(/\n@@/));
  }
}

