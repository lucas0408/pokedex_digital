import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-battle-team',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent, FormsModule],
  templateUrl: './battle-team.component.html',
  styleUrls: ['./battle-team.component.css']
})
export class BattleTeamComponent implements OnInit {
  battleTeam: Pokemon[] = [];
  filteredBattleTeam: Pokemon[] = [];
  paginatedPokemons: Pokemon[] = [];
  
  loading = true;
  searchTerm = '';
  selectedType = 'Todos';
  
  // Paginação
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  totalAttack = 0;
  totalDefense = 0;
  
  // Stats
  uniqueTypes = 0;
  totalPower = 0;
  availableTypes: string[] = ['Todos'];

  constructor(private pokemonService: PokemonService, private router: Router) {}

  ngOnInit(): void {
    this.loadBattleTeam();
  }

  loadBattleTeam(): void {
    this.loading = true;
    this.pokemonService.getBattleTeam().subscribe({
      next: (data) => {
        this.battleTeam = data.slice(0, 6); // Máximo 6 pokémons
        this.calculateStats();
        this.extractTypes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar time de batalha:', err);
        this.loading = false;
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/pokemon-list']);
  }

  calculateStats(): void {
    this.totalAttack = this.battleTeam.reduce((sum, p) => sum + p.attack, 0);
    
    // Calcula defesa total
    this.totalDefense = this.battleTeam.reduce((sum, p) => sum + p.defense, 0);
  }

  extractTypes(): void {
    const typesSet = new Set<string>();
    this.battleTeam.forEach(p => p.tipos.forEach(t => typesSet.add(t)));
    this.availableTypes = Array.from(typesSet).sort();
  }

  filterByType(tipo: string): void {
    this.selectedType = tipo;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.battleTeam];

    // Filtro por tipo
    if (this.selectedType !== 'Todos') {
      filtered = filtered.filter(p => p.tipos.includes(this.selectedType));
    }

    // Filtro por busca (nome ou código)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.nome.toLowerCase().includes(term) || 
        p.codigo.toString().includes(term)
      );
    }

    this.filteredBattleTeam = filtered;
    this.totalPages = Math.ceil(this.filteredBattleTeam.length / this.itemsPerPage) || 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedPokemons = this.filteredBattleTeam.slice(start, end);
  }

  onPagePrev(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  removeFromBattle(pokemon: Pokemon): void {
    this.pokemonService.toggleBattleGroup(pokemon).subscribe(() => {
      this.loadBattleTeam(); // Recarrega a lista após remover
    });
  }
}