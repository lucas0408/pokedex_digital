import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = this.getToken();
    if (token) {
      this.loadUserProfile();
    }
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            if (response.user) {
              this.currentUserSubject.next(response.user as Usuario);
            } else {
              this.loadUserProfile();
            }
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserProfile(): void {
    this.http.get<Usuario>(`${environment.apiUrl}/users/profile`)
      .subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }
}