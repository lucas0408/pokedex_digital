import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login'], { queryParams: { stateUrl: state.url } });
    return false;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp! < currentTime) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};