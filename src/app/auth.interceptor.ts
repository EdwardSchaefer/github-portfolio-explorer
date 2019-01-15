import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let token: string = localStorage.getItem('token');
    if (req['url'].slice(8, 11) === 'api') {
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
