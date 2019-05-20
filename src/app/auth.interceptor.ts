import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Authorization': 'token ' + token
    });
    if (req['url'].slice(req['url'].length - 7, req['url'].length) === '/readme') {
      headers = headers.append('Accept', 'application/vnd.github.v3.html');
    }
    const authReq = req.clone({
      headers: headers
    });
    return next.handle(authReq);
  }
}
