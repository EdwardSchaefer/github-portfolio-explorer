import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'gpe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public username: string;
  public repos: any;
  constructor() {
    this.username = localStorage.getItem('username');
  }
  setUsername(e) {
    if (e.keyCode === 13) {
      e.target.blur();
      localStorage.setItem('username', e.target.value);
    }
  }
}
