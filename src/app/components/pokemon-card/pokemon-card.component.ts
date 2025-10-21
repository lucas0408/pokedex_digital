import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  imports: [ CommonModule ],
  styleUrls: ['./pokemon-card.component.scss'],
  standalone: true
})
export class PokemonCardComponent {
  @Input() pokemon!: Pokemon;

  loadingFav = false;
  loadingTeam = false;

  constructor(private pokemonService: PokemonService) {}

  toggleFavorite() {
    if (!this.pokemon) return;
    this.loadingFav = true;

    this.pokemonService.toggleFavorite(this.pokemon).subscribe({
      next: () => {
        this.pokemon.favorito = !this.pokemon.favorito;
        this.animateButton('favorite-btn');
        this.loadingFav = false;
      },
      error: () => {
        this.loadingFav = false;
      }
    });
  }

  toggleBattleGroup() {
    if (!this.pokemon) return;
    this.loadingTeam = true;

    this.pokemonService.toggleBattleGroup(this.pokemon).subscribe({
      next: () => {
        this.pokemon.grupo_batalha = !this.pokemon.grupo_batalha;
        this.animateButton('battle-btn');
        this.loadingTeam = false;
      },
      error: (err) => {
        alert(err.error?.error || 'Erro ao atualizar grupo de batalha');
        this.loadingTeam = false;
      }
    });
  }

  private animateButton(id: string) {
    const el = document.getElementById(`${id}-${this.pokemon.codigo}`);
    if (el) {
      el.classList.add('clicked');
      setTimeout(() => el.classList.remove('clicked'), 300);
    }
  }
}
