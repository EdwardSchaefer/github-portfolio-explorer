import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule, MatInputModule, MatListModule, MatTreeModule} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import { RepoListComponent } from './components/repo-list/repo-list.component';
import { DirectoryViewerComponent } from './components/directory-viewer/directory-viewer.component';
import { FileViewerComponent } from './components/file-viewer/file-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    RepoListComponent,
    DirectoryViewerComponent,
    FileViewerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatTreeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
