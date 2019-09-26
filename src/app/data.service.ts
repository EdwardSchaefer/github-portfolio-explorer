import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../environments/environment';
import * as hljs from 'highlight.js';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseURL: string;
  username: string;
  selectedPath: string;
  repos: Repo[];
  selectedRepo: Repo;
  file: string;
  readme: BehaviorSubject<string>;
  constructedTree: BehaviorSubject<any>;
  branches: BehaviorSubject<Branch[]>;
  commitsStore: any[];
  commits: BehaviorSubject<Commit[]>;
  diff: BehaviorSubject<any>;
  rateLimit: number;
  rateRemaining: number;
  rateReset: number;
  hljsSheetRef: CSSStyleSheet;
  hljsColors: ThreeJSColors;
  constructor(public http: HttpClient) {
    this.baseURL = 'https://api.github.com';
    this.constructedTree = new BehaviorSubject<any>([]);
    this.branches = new BehaviorSubject<Branch[]>([]);
    this.commits = new BehaviorSubject<Commit[]>([]);
    this.readme = new BehaviorSubject<string>('');
    this.diff = new BehaviorSubject(null);
  }
  getRepos(page) {
    if (this.username) {
      if (environment.repos.length) {
        this.repos = environment.repos.map(repo => {
          return new Repo(repo, repo['default_branch']);
        });
      } else {
        const url = this.baseURL + '/users/' + this.username + '/repos?page=' + page;
        this.http.get<Repo[]>(url, {observe: 'response'}).subscribe(response => {
          this.updateLimits(response.headers);
          if (page === '1') {
            this.repos = [];
          }
          const nextLink = response.headers.get('link');
          response.body.forEach(repo => {
            this.repos.push(new Repo(repo.name, repo['default_branch']));
          });
          if (nextLink) {
            const pageNumber = nextPage(nextLink);
            if (pageNumber) {
              this.getRepos(pageNumber);
            }
          }
        }, error => {
          this.username = '';
          this.repos = [];
        });
      }
    } else {
      this.repos = [];
    }
  }
  selectRepo(repo) {
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
      this.http.get(url, {responseType: 'text', observe: 'response'}).subscribe(response => {
        this.updateLimits(response.headers);
        this.file = null;
        this.readme.next(response.body);
        repo.readme = response;
      });
    }
  }
  getBranches(repo: Repo) {
    const url = this.baseURL + '/repos/' + this.username + '/' + repo.name + '/branches';
    this.http.get<any[]>(url, {observe: 'response'}).subscribe(response => {
      this.updateLimits(response.headers);
      const branches: any[] = response.body;
      repo.branches = branches.map(branch => {
        return new Branch(branch.name, branch.commit.url, branch.commit.sha);
      });
      repo.branches.sort((a, b) => a.name === repo.defaultBranch ? -1 : 1);
      this.branches.next(repo.branches);
      this.getAllCommits(repo, '1');
    });
  }
  getCommits(url) {
    this.http.get(url, {observe: 'response'}).subscribe((response: any) => {
      this.updateLimits(response.headers);
      // most recent commit
      this.getTree(response.body.commit.tree);
    });
  }
  getAllCommits(repo, page) {
    const url = this.baseURL + '/repos/' + this.username + '/' + repo.name + '/commits?page=' + page;
    this.http.get<any[]>(url, {observe: 'response'}).subscribe(response => {
      this.updateLimits(response.headers);
      if (page === '1') {
        this.commitsStore = [];
      }
      const nextLink = response.headers.get('link');
      response.body.forEach(commit => {
        this.commitsStore.push(commit);
      });
      if (nextLink) {
        const pageNumber = nextPage(nextLink);
        if (pageNumber) {
          this.getAllCommits(repo, pageNumber);
        }
      } else {
        repo.branches.map(branch => {
          const foundCommit = this.commitsStore.find(commit => commit['sha'] === branch['headSha']);
          if (foundCommit) {
            foundCommit.branch = branch.name;
          }
        });
        this.commitsStore.forEach((commit, i) => {
          commit['parents'].map(parent => {
            const foundParent = this.commitsStore.find(a => a['sha'] === parent['sha']);
            if (foundParent && !foundParent['branch']) {
              foundParent['branch'] = commit.branch;
            }
          });
        });
        // most recent two commits
        // if (this.commitsStore.length > 1) {
        //   this.diffCommit(repo, this.commitsStore[0].sha);
        // }
        this.commits.next(this.commitsStore);
      }
    });
  }
  diffCommit(repo, sha) {
    if (!this.hljsSheetRef) {
      this.loadhljsSheet();
    }
    const url = this.baseURL + '/repos/' + this.username + '/' + repo.name + '/commits/' + sha;
    this.http.get(url, {observe: 'response'}).subscribe(response => {
      this.updateLimits(response.headers);
      this.diff.next(response.body);
    });
  }
  getTree(commitTree) {
    const recursiveURL = commitTree.url + '?recursive=1';
    this.http.get(recursiveURL, {observe: 'response'}).subscribe(response => {
      this.updateLimits(response.headers);
      const tree = [];
      response.body['tree'].map(a => {
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
    const url = this.baseURL + '/repos/' + this.username + '/' + this.selectedRepo.name + '/contents/' + path + '?ref=' + branchName;
    this.http.get(url, {observe: 'response'}).subscribe(response => {
      this.updateLimits(response.headers);
      const atobFile = atob(response.body['content']);
      const fileArray = hljs.highlightAuto(atobFile).value.split(/\r\n|\r|\n/);
      this.file = '';
      fileArray.forEach((file, i) => this.file = this.file + '<span class="gpe-file-lines">' + i + '</span>' + file + '\r');
    });
  }
  get data() {
    return this.constructedTree.value;
  }
  loadhljsSheet() {
    const sheets: any[] = Object.values(document.styleSheets);
    this.hljsSheetRef = sheets.find(sheet => sheet.href && sheet.href.includes('hljs'));
    if (this.hljsSheetRef) {
      this.hljsColors = new ThreeJSColors(this.hljsSheetRef);
    }
  }
  updateLimits = (headers) => {
    this.rateLimit = headers.get('X-RateLimit-Limit');
    this.rateRemaining = headers.get('X-RateLimit-Remaining');
    this.rateReset = 1000 * (headers.get('X-RateLimit-Reset'));
    // limitHeader: string, remainingHeader: string, resetHeader: string
  }
}

const nextPage = (linkHeader: string) => {
  const nextLink = linkHeader.split(',').find(url => url.includes('next'));
  if (nextLink) {
    return nextLink.split('page=')[1][0];
  }
};

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

export class ThreeJSColors {
  background: string;
  constructor(hljsSheet) {
    const rules: any[] = Object.values(hljsSheet.rules);
    const hljsRule = rules.find(rule => rule.selectorText === '.hljs');
    this.background = hljsRule.style.background;
  }
}
