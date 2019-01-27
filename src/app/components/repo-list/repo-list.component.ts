import { Component, OnInit, Input } from '@angular/core';
import {DataService} from '../../data.service';

@Component({
  selector: 'gpe-repo-list',
  templateUrl: './repo-list.component.html',
  styleUrls: ['./repo-list.component.css']
})
export class RepoListComponent implements OnInit {
  @Input('repos') repos;
  constructor(public data: DataService) { }

  ngOnInit() {

  }

  selectRepo(i) {
    this.data.selectRepo(i);
  }
  selected(index) {
    if (index === this.data.selectedIndex) {
      return 'gpe-repo-list-item-selected';
    } else {
      return 'gpe-repo-list-item';
    }
  }
}
