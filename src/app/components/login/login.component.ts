import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../../models/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  credentials: LoginRequest = {
    login: '',
    senha: ''
  };
  
  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        localStorage.setItem('login', response.user?.login || '');
        localStorage.setItem('role', response.user?.role || '');
        
        this.loading = false;
        
        this.router.navigate(['/pokedex']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}