import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list.component';
import { BattleTeamComponent } from './components/battle-team/battle-team.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'pokemon-list', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pokemon-list', component: PokemonListComponent, canActivate: [authGuard] },
  { path: 'battle-team', component: BattleTeamComponent, canActivate: [authGuard] },
  { path: 'user-management', component: UserManagementComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'pokemon-list' }
];