import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseURL: string;
  username: string;
  selectedIndex: number;
  repos: any;
  readme: any;
  dataChange: any;
  constructor(public http: HttpClient) {
    this.baseURL = 'https://api.github.com';
    this.username = localStorage.getItem('username');
    this.dataChange = new BehaviorSubject<any>([]);
  }
  getRepos() {
    if (this.username) {
      this.http.get(this.baseURL + '/users/' + this.username + '/repos').toPromise().then(response => {
        this.repos = response;
      }).catch(error => {
        console.log(error);
        this.username = '';
        this.repos = [];
      });
    } else {
      this.repos = [];
    }
  }
  selectRepo(i) {
    this.selectedIndex = i;
    this.getReadme();
    this.getCommits();
  }
  getReadme() {
    this.http.get((this.baseURL + '/repos/' + this.username + '/'  + this.repos[this.selectedIndex].name + '/readme')).toPromise().then( response => {
      this.http.get(response['download_url'], {responseType: 'text'}).toPromise().then(response2 => {
        // FIXME: markdown
        this.readme = response2;
      });
    });
  }
  getCommits() {
    this.http.get((this.baseURL + '/repos/' + this.username + '/'  + this.repos[this.selectedIndex].name + '/commits')).toPromise().then(response => {
      // most recent commit
      this.repos[this.selectedIndex].commits = response;
      this.getTree(this.repos[this.selectedIndex].commits[0].commit.tree.url,
        this.repos[this.selectedIndex]);
    });
  }
  getTree(url, path) {
    this.http.get(url).toPromise().then(response => {
      if (path === this.repos[this.selectedIndex]) {
        response['tree'].map(a => {
          if (a.type === 'tree') {
            a['children'] = [{path: '1'}, {path: '2'}];
          }
        });
      }
      path['tree'] = response;
      this.dataChange.next(this.repos[this.selectedIndex].tree.tree);
    });
  }
  get data() {
    return this.dataChange.value;
  }
}
