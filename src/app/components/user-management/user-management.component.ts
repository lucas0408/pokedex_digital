import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  
  showDeleteModal = false;
  userToDelete: Usuario | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('role') !== 'admin') {
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    const currentLogin = localStorage.getItem('login');

    this.userService.getUsers().subscribe({
      next: (res) => {
        this.usuarios = res.usuarios.filter(
          (u: Usuario) => u.login !== currentLogin
        );
        this.filteredUsuarios = [...this.usuarios];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao carregar usuários';
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    this.filteredUsuarios = this.usuarios.filter(u =>
      u.nome.toLowerCase().includes(term) ||
      u.login.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  confirmDelete(usuario: Usuario): void {
    this.userToDelete = usuario;
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  goToListPokemon(){
    this.router.navigateByUrl('pokemon-list');
  }

  deleteUser(): void {
    if (!this.userToDelete) return;

    const userId = this.userToDelete.id;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== userId);
        this.filterUsers(); 
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao excluir usuário';
        this.closeModal();
      }
    });
  }

  changeRole(usuario: Usuario, newRole: string): void {
    this.userService.updateUserRole(usuario.id, newRole).subscribe({
      next: () => {
        usuario.role = newRole;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao atualizar permissão';
        usuario.role = usuario.role === 'admin' ? 'user' : 'admin';
      }
    });
  }

  getAdminCount(): number {
    return this.usuarios.filter(u => u.role === 'admin').length;
  }

  getTotalPokemons(): number {
    return this.usuarios.reduce((sum, u) => sum + (u.total_pokemons || 0), 0);
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}