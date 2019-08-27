import {Component, Inject} from '@angular/core';
import {DataService} from './data.service';
import {environment} from '../environments/environment';
import {DOCUMENT} from '@angular/common';
import * as hljsStyles from '../assets/hljs-styles.json';

@Component({
  selector: 'gpe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public token: string;
  public stylesRef: any = hljsStyles;
  public styles: string[] = this.stylesRef.default.styleNames;
  public style: string;
  public envUsername: boolean;
  public envAPIToken: boolean;
  public envStyle: boolean;
  constructor(@Inject(DOCUMENT) private document: Document, public data: DataService) {
    if (environment.username) {
      this.envUsername = true;
      this.data.username = environment.username;
    } else {
      this.data.username = localStorage.getItem('username');
    }
    if (environment.APItoken) {
      this.envAPIToken = true;
    } else {
      this.token = localStorage.getItem('token');
    }
    if (environment.style) {
      this.envStyle = true;
      this.style = environment.style;
    } else {
      if (!localStorage.getItem('style')) {
        localStorage.setItem('style', 'default');
      }
      this.style = localStorage.getItem('style');
    }
    this.applyStyle(this.style);
    this.data.getRepos();
  }
  setUsername(e) {
    if (e.keyCode === 13) {
      e.target.blur();
      localStorage.setItem('username', e.target.value);
      this.data.username = e.target.value;
      this.data.getRepos();
    }
  }
  setToken(e) {
    if (e.keyCode === 13) {
      e.target.blur();
      localStorage.setItem('token', e.target.value);
      this.data.getRepos();
    }
  }
  setStyles(e) {
    const styleName = e.value;
    localStorage.setItem('style', styleName);
    this.applyStyle(styleName);
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
