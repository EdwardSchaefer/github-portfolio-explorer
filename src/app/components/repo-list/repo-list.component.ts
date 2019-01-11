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
}
