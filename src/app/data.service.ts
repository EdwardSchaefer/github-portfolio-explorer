import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseURL: string;
  username: string;
  selectedIndex: number;
  selectedPath: string;
  repos: Repo[];
  selectedRepo: Repo;
  file: any;
  newLineCounter: any;
  readme: BehaviorSubject<string>;
  constructedTree: BehaviorSubject<any>;
  branches: BehaviorSubject<Branch[]>;
  constructor(public http: HttpClient) {
    this.baseURL = 'https://api.github.com';
    if (environment.username) {
      this.username = environment.username;
    } else {
      this.username = localStorage.getItem('username');
    }
    this.constructedTree = new BehaviorSubject<any>([]);
    this.branches = new BehaviorSubject<Branch[]>([]);
    this.readme = new BehaviorSubject<string>('');
  }
  getRepos() {
    if (this.username) {
      if (environment.repos.length) {
        this.repos = environment.repos.map(repo => {
          return new Repo(repo);
        });
      } else {
        this.http.get<Repo[]>(this.baseURL + '/users/' + this.username + '/repos').subscribe(response => {
          this.repos = response.map(repo => {
            return new Repo(repo.name);
          });
        }, error => {
          this.username = '';
          this.repos = [];
        });
      }
    } else {
      this.repos = [];
    }
  }
  selectRepo(repo, i) {
    this.selectedIndex = i;
    this.getReadme(repo);
    this.getBranches(repo);
    this.selectedRepo = repo;
    this.file = '';
  }
  getReadme(repo) {
    if (repo.readme) {
      this.readme.next(repo.readme);
    } else {
      const url = this.baseURL + '/repos/' + this.username + '/'  + repo.name + '/readme';
      this.http.get(url, {responseType: 'text'}).subscribe(response => {
        this.file = null;
        this.readme.next(response);
        repo.readme = response;
      });
    }
  }
  getBranches(repo: Repo) {
    this.http.get((this.baseURL + '/repos/' + this.username + '/' + repo.name + '/branches')).subscribe((branches: any[]) => {
      repo.branches = branches.map(branch => {
        return new Branch(branch.name, branch.commit.url);
      });
      this.branches.next(repo.branches);
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

export class Repo {
  name: string;
  branches: Branch[];
  readme: string;
  constructor(name) {
    this.name = name;
  }
}

export class Branch {
  name: string;
  commitUrl: string;
  commits: Commit[];
  constructor(name, commitUrl) {
    this.name = name;
    this.commitUrl = commitUrl;
  }
}

export class Commit {
  tree: Tree;
}

export class Tree {
  path: any;
}
