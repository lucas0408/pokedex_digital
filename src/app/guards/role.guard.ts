import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models/usuario.model';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const hasRequiredRole = decodedToken.roles.some(role => 
        allowedRoles.includes(role)
      );
      
      localStorage.setItem("login", decodedToken.sub)

      localStorage.setItem("role", decodedToken.roles[0])

      if (!hasRequiredRole) {
        router.navigate(['/products']);
        return false;
      }

      return true;
    } catch {
      router.navigate(['/login']);
      return false;
    }
  };
};