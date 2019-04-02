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
  repos: Repo[];
  selectedRepo: Repo;
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
      this.http.get<Repo[]>(this.baseURL + '/users/' + this.username + '/repos').subscribe(response => {
        this.repos = response.map(repo => {
          return new Repo(repo.name);
        });
      }, error => {
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
    this.selectedRepo = repo;
  }
  getReadme(repo) {
    const url = this.baseURL + '/repos/' + this.username + '/'  + repo.name + '/readme';
    this.http.get(url, {responseType: 'text'}).subscribe(response => {
      this.file = null;
      this.readme.next(response);
      repo.readme = response;
    });
  }
  getBranches(repo: Repo) {
    this.http.get((this.baseURL + '/repos/' + this.username + '/' + repo.name + '/branches')).subscribe((branches: any[]) => {
      repo.branches = branches.map(branch => {
        return new Branch(branch.name, branch.commit.url);
      });
      this.branches.next(branches);
      this.file = '';
      this.readme.next('');
      const masterBranch = repo.branches.find(branch => branch['name'] === 'master');
      let defaultBranch: Branch;
      if (masterBranch) {
        defaultBranch = masterBranch;
      } else {
        defaultBranch = this.branches[0];
      }
      repo.selectedBranch = defaultBranch;
      this.getCommits(defaultBranch.commitUrl);
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
  selectedBranch: Branch;
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
