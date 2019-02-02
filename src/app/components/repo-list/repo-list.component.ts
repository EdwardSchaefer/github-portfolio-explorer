import {Component, Input, OnChanges} from '@angular/core';
import {DataService} from '../../data.service';
import {RepoListAnimations} from './repo-list.animations';

@Component({
  selector: 'gpe-repo-list',
  templateUrl: './repo-list.component.html',
  styleUrls: ['./repo-list.component.css'],
  animations: [RepoListAnimations]
})
export class RepoListComponent implements OnChanges {
  @Input('repos') repos;
  filteredRepos: any[] = [];
  constructor(public data: DataService) {}
  ngOnChanges() {
    this.filteredRepos = this.repos;
  }
  selectRepo(repo, i) {
    this.data.selectRepo(repo, i);
  }
  selected(index) {
    if (index === this.data.selectedIndex) {
      return 'gpe-repo-list-item-selected';
    } else {
      return 'gpe-repo-list-item';
    }
  }
  filterRepos(event) {
    this.filteredRepos = this.repos.filter(a => a['name'].includes(event.target.value));
  }
}
