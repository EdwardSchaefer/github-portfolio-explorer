import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseURL: string;
  username: string;
  selectedIndex: number;
  selectedPath: string;
  repos: any;
  file: any;
  readme: any;
  constructedTree: any;
  constructor(public http: HttpClient) {
    this.baseURL = 'https://api.github.com';
    this.username = localStorage.getItem('username');
    this.constructedTree = new BehaviorSubject<any>([]);
    this.readme = new BehaviorSubject<string>('');
  }
  getRepos() {
    if (this.username) {
      this.http.get(this.baseURL + '/users/' + this.username + '/repos').subscribe(response => {
        this.repos = response;
      }, error => {
        console.log(error);
        this.username = '';
        this.repos = [];
      });
    } else {
      this.repos = [];
    }
  }
  selectRepo(repo, i) {
    this.selectedIndex = i;
    this.getReadme(repo);
    this.getCommits(repo);
  }
  getReadme(repo) {
    const url = this.baseURL + '/repos/' + this.username + '/'  + repo.name + '/readme';
    this.http.get(url, {responseType: 'text'}).subscribe(response => {
      this.file = null;
      this.readme.next(response);
    });
  }
  getCommits(repo) {
    this.http.get((this.baseURL + '/repos/' + this.username + '/'  + repo.name + '/commits')).toPromise().then(response => {
      // most recent commit
      repo.commits = response;
      this.getTree(repo);
      // this.getTree(repo.commits[0].commit.tree.url, this.repos[this.selectedIndex]);
    });
  }
  getTree(repo) {
    const recursiveURL = repo.commits[0].commit.tree.url + '?recursive=1';
    this.http.get(recursiveURL).subscribe(response => {
      const tree = [];
        response['tree'].map(a => {
          if (a.type === 'tree') {
            a['children'] = [];
          }
          let foundNode = tree;
          const pathArray = a['path'].split('/');
          if (pathArray.length < 2) {
            tree.push(a);
          } else {
            pathArray.map((pathFragment, i) => {
              if (i < pathArray.length - 1) {
                if (!i) {
                  foundNode = foundNode.find(b => b['path'].split('/')[b['path'].split('/').length - 1] === pathFragment);
                } else {
                  foundNode = foundNode['children'].find(b => b['path'].split('/')[b['path'].split('/').length - 1] === pathFragment);
                }
              } else {
                foundNode['children'].push(a);
              }
            });
          }
        });
      this.constructedTree.next(tree);
    });
  }
  getFile(path) {
    this.selectedPath = path;
    this.http.get(this.baseURL + '/repos/' + this.username + '/' + this.repos[this.selectedIndex].name + '/contents/' + path).subscribe(response => {
      this.file = atob(response['content']);
    });
  }
  get data() {
    return this.constructedTree.value;
  }
}
