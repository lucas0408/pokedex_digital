export interface Pokemon {
  id: number;
  codigo: string;
  nome: string;
  imagem_url: string;
  tipos: string[];
  favorito: boolean;
  grupo_batalha: boolean;
  hp: number;
  attack: number;
  defense: number;
}

export interface Geracao {
  id: number;
  nome: string;
  offset: number;
  limit: number;
}

export const GERACOES: Geracao[] = [
  { id: 0, nome: 'Todas as Gerações', offset: 0, limit: 1000 },
  { id: 1, nome: 'Geração I (Kanto)', offset: 0, limit: 151 },
  { id: 2, nome: 'Geração II (Johto)', offset: 151, limit: 100 },
  { id: 3, nome: 'Geração III (Hoenn)', offset: 251, limit: 135 },
  { id: 4, nome: 'Geração IV (Sinnoh)', offset: 386, limit: 107 },
  { id: 5, nome: 'Geração V (Unova)', offset: 493, limit: 156 },
  { id: 6, nome: 'Geração VI (Kalos)', offset: 649, limit: 72 },
  { id: 7, nome: 'Geração VII (Alola)', offset: 721, limit: 88 },
  { id: 8, nome: 'Geração VIII (Galar)', offset: 809, limit: 96 },
];

// Mapeamento de tipos da API para nomes em português
export const TIPO_TRADUCAO: { [key: string]: string } = {
  'normal': 'Normal',
  'fire': 'Fogo',
  'water': 'Água',
  'grass': 'Grama',
  'electric': 'Elétrico',
  'ice': 'Gelo',
  'fighting': 'Lutador',
  'poison': 'Veneno',
  'ground': 'Terra',
  'flying': 'Voador',
  'psychic': 'Psíquico',
  'bug': 'Inseto',
  'rock': 'Pedra',
  'ghost': 'Fantasma',
  'dragon': 'Dragão',
  'dark': 'Sombrio',
  'steel': 'Metálico',
  'fairy': 'Fada'
};

export interface PokemonApi {
  codigo: string;
  nome: string;
  imagem_url: string;
  tipos: string[];
  altura: number;
  peso: number;
}

export interface PokemonListResponse {
  total: number;
  pokemons: Pokemon[];
}

export interface CapturePokemonRequest {
  codigo: string;
  nome: string;
  id_tipo_pokemon: number;
  imagem_url?: string;
}

