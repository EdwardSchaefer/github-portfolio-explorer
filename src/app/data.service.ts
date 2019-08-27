import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../environments/environment';
import * as hljs from 'highlight.js';

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
  file: string;
  readme: BehaviorSubject<string>;
  constructedTree: BehaviorSubject<any>;
  branches: BehaviorSubject<Branch[]>;
  commits: BehaviorSubject<Commit[]>;
  diff: BehaviorSubject<any>;
  constructor(public http: HttpClient) {
    this.baseURL = 'https://api.github.com';
    this.constructedTree = new BehaviorSubject<any>([]);
    this.branches = new BehaviorSubject<Branch[]>([]);
    this.commits = new BehaviorSubject<Commit[]>([]);
    this.readme = new BehaviorSubject<string>('');
    this.diff = new BehaviorSubject(null);
  }
  getRepos() {
    if (this.username) {
      if (environment.repos.length) {
        this.repos = environment.repos.map(repo => {
          return new Repo(repo, repo['default_branch']);
        });
      } else {
        this.http.get<Repo[]>(this.baseURL + '/users/' + this.username + '/repos').subscribe(response => {
          this.repos = response.map(repo => {
            return new Repo(repo.name, repo['default_branch']);
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
        return new Branch(branch.name, branch.commit.url, branch.commit.sha);
      });
      repo.branches.sort((a, b) => a.name === repo.defaultBranch ? -1 : 1);
      this.branches.next(repo.branches);
      this.getAllCommits(repo);
    });
  }
  getCommits(url) {
    this.http.get(url).subscribe((response: any) => {
      // most recent commit
      this.getTree(response.commit.tree);
    });
  }
  getAllCommits(repo) {
    this.http.get((this.baseURL + '/repos/' + this.username + '/' + repo.name + '/commits')).subscribe((commits: any[]) => {
      repo.branches.map(branch => {
        const foundCommit = commits.find(commit => commit['sha'] === branch['headSha']);
        if (foundCommit) {
          foundCommit.branch = branch.name;
        }
      });
      commits.map((commit, i) => {
        commit['parents'].map(parent => {
          const foundParent = commits.find(a => a['sha'] === parent['sha']);
          if (foundParent && !foundParent['branch']) {
            foundParent['branch'] = commit.branch;
          }
        });
      });
      // arbitrary valid commit
      this.compareCommits(repo, repo.branches[0].headSha, repo.branches[1].headSha);
      this.commits.next(commits);
    });
  }
  compareCommits(repo, base, head) {
    const url = this.baseURL + '/repos/' + this.username + '/' + repo.name + '/compare/' + base + '...' + head;
    this.http.get(url).subscribe(response => {
      this.diff.next(response);
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
      const atobFile = atob(response['content']);
      const fileArray = hljs.highlightAuto(atobFile).value.split(/\r\n|\r|\n/);
      this.file = '';
      fileArray.forEach((file, i) => this.file = this.file + '<span class="gpe-file-lines">' + i + '</span>' + file + '\r');
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
  defaultBranch: string;
  constructor(name, defaultBranch) {
    this.name = name;
    this.defaultBranch = defaultBranch;
  }
}

export class Branch {
  name: string;
  commitUrl: string;
  headSha: string;
  commits: Commit[];
  constructor(name, commitUrl, sha) {
    this.name = name;
    this.commitUrl = commitUrl;
    this.headSha = sha;
  }
}

export class Commit {
  tree: Tree;
}

export class Tree {
  path: any;
}

