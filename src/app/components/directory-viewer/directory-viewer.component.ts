import {AfterViewInit, Component, OnChanges, ViewChild} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Branch, DataService, FileResponse} from '../../data.service';
import {DirectoryViewerAnimations} from './directory-viewer-animations';
import {ColorService} from '../../color.service';

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

@Component({
  selector: 'gpe-directory-viewer',
  templateUrl: './directory-viewer.component.html',
  styleUrls: ['./directory-viewer.component.css'],
  animations: [DirectoryViewerAnimations]
})
export class DirectoryViewerComponent implements AfterViewInit {
  @ViewChild('branchSelect', { static: true }) branchSelect;
  private transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node['path'],
      level: level,
    };
  }
  treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);
  treeFlattener = new MatTreeFlattener(this.transformer, node => node.level,
      node => node.expandable, node => node.children);
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  tree: any;
  branches: any[] = [];
  selectedBranch: any;
  constructor(public data: DataService, public color: ColorService) {
    data.constructedTree.subscribe(selectedData => {
      this.dataSource.data = selectedData;
    });
    data.branches.subscribe(branches => {
      if (branches && this.branchSelect) {
        this.branches = branches;
        const masterBranch = this.branches.find(branch => branch['name'] === 'master');
        let defaultBranch: Branch;
        if (masterBranch) {
          defaultBranch = masterBranch;
        } else {
          defaultBranch = this.branches[0];
        }
        this.selectedBranch = defaultBranch;
        this.data.getCommits(this.selectedBranch.commitUrl);
      }
    });
  }
  ngAfterViewInit() {
    this.branchSelect.valueChange.subscribe(selectedBranch => {
      this.data.getCommits(this.selectedBranch.commitUrl);
    });
  }

  endNode(node) {
    let branchName: string;
    if (this.selectedBranch) {
      branchName = this.selectedBranch.name;
    } else {
      branchName = 'master';
    }
    this.data.getFile(node['name'], branchName).subscribe((file: FileResponse) => {
      this.data.selectedPath = node['name'];
      this.data.selectedFile.next(this.color.addLines(this.color.colorize(file.data)));
    });
  }
  getFileName(node) {
    return node.name.split('/')[node['name'].split('/').length - 1];
  }
  selected(node) {
    if (node['name'] === this.data.selectedPath) {
      return 'gpe-file-list-item-selected';
    } else {
      return 'gpe-file-list-item';
    }
  }
  hasChild = (_: number, node: FlatNode) => node.expandable;
  private _getChildren = (node) => node.children;
}
