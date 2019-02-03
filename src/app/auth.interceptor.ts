import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token: string = localStorage.getItem('token');
    if (req['url'].slice(req['url'].length - 7, req['url'].length) === '/readme') {
      const headers = new HttpHeaders({
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3.html'
      });
      const authReq = req.clone({
        headers: headers
      });
      return next.handle(authReq);
    } else if (req['url'].slice(8, 11) === 'api') {
      const headers = new HttpHeaders({
        'Authorization': 'token ' + token
      });
      const authReq = req.clone({
        headers: headers
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
