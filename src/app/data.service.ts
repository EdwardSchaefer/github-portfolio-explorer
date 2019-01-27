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
  selectedPath: string;
  repos: any;
  file: any;
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
      // this.http.get(response['html_url'], {responseType: 'text'}).toPromise().then(response2 => {
      this.http.get(response['download_url'], {responseType: 'text'}).toPromise().then(response2 => {
        // FIXME: markdown / pre / html
        this.file = response2;
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
    const recursiveURL = url + '?recursive=1';
    this.http.get(recursiveURL).toPromise().then(response => {
      const tree = [];
      if (path === this.repos[this.selectedIndex]) {
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
      }
      this.dataChange.next(tree);
    });
  }
  getFile(path) {
    this.selectedPath = path;
    this.http.get(this.baseURL + '/repos/' + this.username + '/' + this.repos[this.selectedIndex].name + '/contents/' + path).toPromise().then(response => {
      this.file = atob(response['content']);
    });
  }
  get data() {
    return this.dataChange.value;
  }
}
