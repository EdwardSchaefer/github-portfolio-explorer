import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataService} from './data.service';

@Component({
  selector: 'gpe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public username: string;
  public token: string;
  constructor(public data: DataService) {
    this.username = localStorage.getItem('username');
    this.token = localStorage.getItem('token');
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
