import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { PokemonService } from '../../services/pokemon.service'; 
import { Pokemon, Geracao, GERACOES, TIPO_TRADUCAO } from '../../models/pokemon.model'; 
import { CollectionService } from '../../services/collection.service'; 
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pokemon-list',
  standalone: true, 
  imports: [CommonModule, FormsModule, PokemonCardComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];
  filteredPokemons: Pokemon[] = [];
  tipos: string[] = [];
  selectedType: string = 'todos';
  total = 0;
  Math = Math;
  limit = 68;
  offset = 0;
  gotoPageInput: number | null = null;
  page = 1;
  searchTerm = '';
  geracoes: Geracao[] = GERACOES;
  selectedGeracao: Geracao = this.geracoes[0];
  loading = false;
  message = '';
  isAdmin: boolean = false;
  showingFavorites: boolean = false; 

  constructor(
    private pokemonService: PokemonService,
    private collectionService: CollectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = localStorage.getItem('role') === 'admin';
    this.filteredPokemons = []
    this.loadTypes();
    this.load();
    this.collectionService.refresh$.subscribe(() => this.load());
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('login');
    this.router.navigateByUrl('login');
  }

  goToBattleTeam(): void {
    this.router.navigateByUrl('battle-team');
  }

  goToUserManagement(): void {
    this.router.navigateByUrl('user-management');
  }

  goToFavorites(): void {
    this.loading = true;
    this.message = '';
    this.showingFavorites = true;
    this.filteredPokemons = [];

    this.pokemonService.getFavoritePokemons().subscribe({
      next: (res: any) => {
        this.filteredPokemons = res.pokemons;
        this.total = res.total;
        this.loading = false;
      },
      error: (err: any) => {
        this.message = 'Erro ao carregar seus Pokémons favoritos.';
        this.loading = false;
      }
    });
  }

  goToAllPokemons(): void {
    this.showingFavorites = false;
    this.load();
  }

  searchPokemon(): void {
    if (!this.searchTerm.trim()) {
      this.message = 'Please enter a Pokémon name';
      this.filteredPokemons = [];
      return;
    }

    this.message = '';
    this.pokemonService.getPokemonByName(this.searchTerm.trim()).subscribe({
      next: (p) => {
        if (p) {
          this.filteredPokemons = [p];
          this.message = '';
        } else {
          this.filteredPokemons = [];
          this.message = 'Pokémon not found';
        }
      },
      error: (err) => {
          this.filteredPokemons = [];
        this.message = 'Error fetching Pokémon';
      }
    });
  }

  loadTypes(): void {
    const tiposDisponiveis = Object.values(TIPO_TRADUCAO);
    this.tipos = ['todos', ...tiposDisponiveis];
  }

  load(): void {
    this.loading = true;
    this.filteredPokemons = []
    this.message = '';

    const tipoApi = this.selectedType === 'todos'
      ? 'todos'
      : Object.keys(TIPO_TRADUCAO).find(k => TIPO_TRADUCAO[k] === this.selectedType) || 'todos';

    let observable;

    if(this.selectedGeracao.id != 0){
      observable = this.pokemonService.listPokemonsByGeneration(this.selectedGeracao.id, this.page, tipoApi)
    } else if(tipoApi === 'todos'){
      observable = this.pokemonService.listPokemons(this.page)
    } else {
      observable = this.pokemonService.listPokemonsByType(tipoApi, this.page);
    }

    observable.subscribe({
      next: (res: any) => {
        this.pokemons = res.results;       
        this.total = res.count;
        this.filteredPokemons = this.pokemons; 
        this.limit = res.pages;       
        this.loading = false;
        console.log(this.pokemons)

        this.pokemonService.getFavoritePokemons().subscribe({
          next: (userPokemons) => {
            this.mergeUserData(userPokemons.pokemons);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.message = 'Erro ao carregar pokémons. Tente novamente.';
        this.loading = false;
      }
    });
  }

  private mergeUserData(userPokemons: any[]): void {
    const userMap = new Map(userPokemons.map(p => [p.codigo, p]));

    this.filteredPokemons = this.filteredPokemons.map(p => {
      const userData = userMap.get(p.codigo);
      return {
        ...p,
        favorito: userData ? userData.favorito : false,
        grupo_batalha: userData ? userData.grupo_batalha : false
      };
    });
  }

  onPageNext(): void {
    if (this.limit > this.page) {
      this.page++;
      this.load();
    }
  }

  onPagePrev(): void {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }

  goToPage(): void {
    if (this.gotoPageInput && this.gotoPageInput >= 1 && this.gotoPageInput <= this.limit) {
      this.page = this.gotoPageInput;
      this.load();
      this.gotoPageInput = null; // Limpa o input após navegar
    }
  }

  get canPagePrevious(): boolean {
    return this.page > 1;
  }

  get canPageNext(): boolean {
    return this.page < this.limit;
  }

  filterByType(tipo: string): void {
    if (this.selectedType !== tipo) {
      this.selectedType = tipo;
      this.page = 1;
      this.load();
    }
  }

  onGenerationChange(): void {
    this.page = 1;
    this.load();
  }

  handleUpdated(): void {
    this.load();
  }
}
