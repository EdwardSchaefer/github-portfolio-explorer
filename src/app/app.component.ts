import {Component, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataService} from './data.service';
import {environment} from '../environments/environment';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'gpe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public username: string;
  public token: string;
  public style: string = 'default';
  public envUsername: boolean;
  public envAPIToken: boolean;
  public envStyle: boolean;
  constructor(@Inject(DOCUMENT) private document: Document, public data: DataService) {
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
    if (environment.style) {
      this.envStyle = true;
    } else {
      this.style = localStorage.getItem('style');
      this.applyStyle(this.style);
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
  setStyles(e) {
    if (e.keyCode === 13) {
      const styleName = e.target.value;
      e.target.blur();
      localStorage.setItem('style', styleName);
      this.applyStyle(styleName);
    }
  }
  applyStyle(styleName) {
    const stylePath = 'hljsStyles/' + styleName + '.css';
    const head = this.document.getElementsByTagName('head')[0];
    const themeLink = this.document.getElementById('client-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = stylePath;
    } else {
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = stylePath;
      head.appendChild(style);
    }
  }
}
