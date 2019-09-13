import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule, MatTreeModule} from '@angular/material';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { RepoListComponent } from './components/repo-list/repo-list.component';
import { DirectoryViewerComponent } from './components/directory-viewer/directory-viewer.component';
import { FileViewerComponent } from './components/file-viewer/file-viewer.component';
import {AuthInterceptor} from './auth.interceptor';
import {FormsModule} from '@angular/forms';
import {CommitGraphComponent} from './components/commit-graph/commit-graph.component';
import { DifferComponent } from './components/differ/differ.component';

@NgModule({
  declarations: [
    AppComponent,
    RepoListComponent,
    DirectoryViewerComponent,
    FileViewerComponent,
    CommitGraphComponent,
    DifferComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatTreeModule,
    MatButtonModule,
    MatSelectModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
