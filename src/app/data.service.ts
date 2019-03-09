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
  newLineCounter: any;
  readme: any;
  constructedTree: any;
  branches: any;
  constructor(public http: HttpClient) {
    this.baseURL = 'https://api.github.com';
    this.username = localStorage.getItem('username');
    this.constructedTree = new BehaviorSubject<any>([]);
    this.branches = new BehaviorSubject<any>([]);
    this.readme = new BehaviorSubject<string>('');
  }
  getRepos() {
    if (this.username) {
      this.http.get(this.baseURL + '/users/' + this.username + '/repos').subscribe(response => {
        // console.log('repos: ', response);
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
    this.getBranches(repo);
  }
  getReadme(repo) {
    const url = this.baseURL + '/repos/' + this.username + '/'  + repo.name + '/readme';
    this.http.get(url, {responseType: 'text'}).subscribe(response => {
      this.file = null;
      this.readme.next(response);
    });
  }
  getBranches(repo) {
    this.http.get((this.baseURL + '/repos/' + this.username + '/' + repo.name + '/branches')).subscribe((branches: any[]) => {
      this.branches.next(branches);
      this.file = '';
      this.readme.next('');
      const masterBranch = branches.find(branch => branch['name'] === 'master');
      let defaultBranch: any;
      if (masterBranch) {
        defaultBranch = masterBranch;
      } else {
        defaultBranch = this.branches[0];
      }
      this.getCommits(defaultBranch.commit.url);
    });
  }
  getCommits(url) {
    this.http.get(url).subscribe((response: any) => {
      // most recent commit
      this.getTree(response.commit.tree);
    });
  }
  getTree(commitTree) {
    const recursiveURL = commitTree.url + '?recursive=1';
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
  getFile(path, branchName) {
    this.selectedPath = path;
    const url = this.baseURL + '/repos/' + this.username + '/' + this.repos[this.selectedIndex].name + '/contents/' + path + '?ref=' + branchName;
    this.http.get(url).subscribe(response => {
      this.file = atob(response['content']);
      this.newLineCounter = this.file.split(/\r\n|\r|\n/);
    });
  }
  get data() {
    return this.constructedTree.value;
  }
}
