import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataService} from './data.service';
import {environment} from '../environments/environment';

@Component({
  selector: 'gpe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public username: string;
  public token: string;
  public envUsername: boolean;
  public envAPIToken: boolean;
  constructor(public data: DataService) {
    if (environment.username) {
      this.envUsername = true;
    } else {
      this.username = localStorage.getItem('username');
    }
    if (environment.APItoken) {
      this.envAPIToken = true;
    } else {
      this.token = localStorage.getItem('token');
    }
    this.data.getRepos();
  }
  setUsername(e) {
    if (e.keyCode === 13) {
      e.target.blur();
      localStorage.setItem('username', e.target.value);
    }
  }
  setToken(e) {
    if (e.keyCode === 13) {
      e.target.blur();
      localStorage.setItem('token', e.target.value);
    }
  }
}
