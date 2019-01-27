import {Component, OnChanges, OnInit} from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {DataService} from '../../data.service';

@Component({
  selector: 'gpe-directory-viewer',
  templateUrl: './directory-viewer.component.html',
  styleUrls: ['./directory-viewer.component.css']
})
export class DirectoryViewerComponent implements OnInit, OnChanges {
  nestedTreeControl: NestedTreeControl<any>;
  nestedDataSource: MatTreeNestedDataSource<any>;
  tree: any;
  constructor(public data: DataService) {
    this.nestedTreeControl = new NestedTreeControl<any>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    data.dataChange.subscribe(selectedData => {
      this.nestedDataSource.data = selectedData;
    });
  }
  ngOnInit() {}
  ngOnChanges() {
    this.tree = this.data.repos[this.data.selectedIndex];
    this.nestedDataSource.data = this.tree;
  }
  endNode(node) {
    this.data.getFile(node['path']);
  }
  getFileName(node) {
    return node.path.split('/')[node['path'].split('/').length - 1];
  }
  selected(node) {
    if (node['path'] === this.data.selectedPath) {
      return 'gpe-file-list-item-selected';
    } else {
      return 'gpe-file-list-item';
    }
  }
  hasNestedChild = (_: number, nodeData: any) => nodeData.type === 'tree';
  private _getChildren = (node) => node.children;
}
