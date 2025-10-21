import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Usuario,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserStats
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<{ total: number; usuarios: Usuario[] }> {
    return this.http.get<{ total: number; usuarios: Usuario[] }>(`${this.apiUrl}/list`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateUserRole(id: number, role: string): Observable<void> {
    console.log(role)
    return this.http.patch<void>(`${this.apiUrl}/${id}`, { role });
  }
}
