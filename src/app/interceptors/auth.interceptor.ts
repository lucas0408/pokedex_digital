import { HttpInterceptorFn } from '@angular/common/http';
import { JwtPayload } from '../models/usuario.model';
import { jwtDecode } from 'jwt-decode';

export const customInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof localStorage !== 'undefined'){
    const token = localStorage.getItem("token")
    if (token) {
      const clonedReq = req.clone({
        setHeaders:{
        Authorization: `Bearer ${token} `
        }
      });
    
      return next(clonedReq);
    }
  }

  return next(req);
};