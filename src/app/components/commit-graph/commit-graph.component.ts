import {Component, Input, OnChanges} from '@angular/core';
import {DataService} from '../../data.service';

@Component({
  selector: 'gpe-commit-graph',
  templateUrl: './commit-graph.component.html',
  styleUrls: ['./commit-graph.component.css']
})
export class CommitGraphComponent implements OnChanges {
  @Input('branches') branches;
  @Input('commits') commits;
  constructor(public data: DataService) { }

  ngOnChanges() {

  }

  selectCommit(commit) {
    // this.data.getTree(commit.commit.tree);
    this.data.diffCommit(this.data.selectedRepo, commit.sha);
  }
}
