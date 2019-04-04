import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataService} from './data.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'gpe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public username: string;
  public token: string;
  constructor(public data: DataService, public route: ActivatedRoute, public router: Router) {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['username']) {
        this.username = queryParams['username'];
        localStorage.setItem('username', this.username);
      }
      if (queryParams['token']) {
        this.token = queryParams['token'];
        localStorage.setItem('token', this.token);
      }
      this.data.getRepos();
    });
  }
  setUsername(e) {
    if (e.keyCode === 13) {
      e.target.blur();
      this.router.navigate([''], {queryParams: {username: e.target.value, token: this.token}});
      // localStorage.setItem('username', e.target.value);
    }
  }
  setToken(e) {
    if (e.keyCode === 13) {
      e.target.blur();
      this.router.navigate([''], {queryParams: {username: this.username, token: e.target.value}});
      // localStorage.setItem('token', e.target.value);
    }
  }
}
