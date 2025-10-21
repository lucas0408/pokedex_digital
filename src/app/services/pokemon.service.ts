import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, catchError, of, throwError  } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Pokemon,
  TIPO_TRADUCAO,
  PokemonApi,
  PokemonListResponse,
  CapturePokemonRequest
} from '../models/pokemon.model';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon';

  private apiUrl = `${environment.apiUrl}/pokemon`;

  constructor(private http: HttpClient) {}

  // Buscar Pokémon na PokéAPI via backend
  searchPokemon(query: string): Observable<PokemonApi> {
    return this.http.get<PokemonApi>(`${this.apiUrl}/search?q=${query}`);
  }

  getPokemonByName(name: string): Observable<Pokemon | null> {
    return this.http.get<any>(`${this.POKEAPI_URL}/${name.toLowerCase()}`).pipe(
      map(p => {
        return {
          id: +p.id,
          codigo: p.id.toString().padStart(3, '0'),
          nome: this.capitalizarNome(p.name),
          imagem_url: p.sprites?.front_default || 'assets/pokeball.png',
          tipos: p.types.map((t: any) => TIPO_TRADUCAO[t.type.name] || t.type.name),
          favorito: false,
          grupo_batalha: false,
          hp: p.stats?.find((s: any) => s.stat.name === 'hp')?.base_stat || 0,
          attack: p.stats?.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
          defense: p.stats?.find((s: any) => s.stat.name === 'defense')?.base_stat || 0
        } as Pokemon;
      }),
      catchError(err => {
        return of(null); // retorna null se não encontrar
      })
    );
  }

  // Função para buscar detalhes de um Pokémon individual
  private fetchPokemonDetail(idOrName: string | number): Observable<Pokemon | null> {
    return this.http.get<any>(`${this.POKEAPI_URL}/${idOrName}`).pipe(
      map(d => {
        const stats = d.stats.reduce((acc: any, s: any) => {
          acc[s.stat.name] = s.base_stat;
          return acc;
        }, {});

        const types = d.types.map((t: any) => t.type.name);

        return {
          id: +d.id,
          codigo: d.id.toString().padStart(3, '0'),
          nome: this.capitalizarNome(d.name),
          imagem_url: d.sprites?.front_default || 'assets/pokeball.png',
          tipos: types.map((t: string) => TIPO_TRADUCAO[t] || t),
          favorito: false,
          grupo_batalha: false,
          hp: stats.hp || 0,
          attack: stats.attack || 0,
          defense: stats.defense || 0
        } as Pokemon;
      }),
      catchError(err => {
        return of(null);
      })
    );
  }

listPokemonsByGeneration(idGeneration: number, page: number = 1, type: string): Observable<{ results: Pokemon[], count: number, pages: number }> {
  const GERACOES: any = {
    1: { inicio: 1, fim: 151 },
    2: { inicio: 152, fim: 251 },
    3: { inicio: 252, fim: 386 },
    4: { inicio: 387, fim: 493 },
    5: { inicio: 494, fim: 649 },
    6: { inicio: 650, fim: 721 },
    7: { inicio: 722, fim: 809 },
    8: { inicio: 810, fim: 905 },
  };
  
  const limit = 12;
  const inicio = GERACOES[idGeneration].inicio;
  const fim = GERACOES[idGeneration].fim;
  
  // Se for "todos", usa paginação normal
  if (type === 'todos') {
    const offset = (page - 1) * limit + inicio;
    const contadorFinal = Math.min(offset + limit - 1, fim);
    const requests: Observable<Pokemon | null>[] = [];

    for (let i = offset; i <= contadorFinal; i++) {
      requests.push(
        this.fetchPokemonDetail(i).pipe(
          catchError(() => of(null))
        )
      );
    }

    const totalPages = Math.ceil((fim - inicio + 1) / limit);
    
    return forkJoin(requests).pipe(
      map(results => {
        const pokemons = results.filter(p => p !== null) as Pokemon[];
        return {
          results: pokemons,
          count: pokemons.length,
          pages: totalPages
        };
      })
    );
  }

  // Se filtrar por tipo, busca TODOS da geração e depois filtra
  const requests: Observable<Pokemon | null>[] = [];
  
  for (let i = inicio; i <= fim; i++) {
    requests.push(
      this.fetchPokemonDetail(i).pipe(
        catchError(() => of(null))
      )
    );
  }

  return forkJoin(requests).pipe(
    map(results => {
      // Filtra apenas os pokémons válidos
      let pokemons = results.filter(p => p !== null) as Pokemon[];
      
      // Filtra por tipo
      const tipoTraduzido = TIPO_TRADUCAO[type]?.toLowerCase() || type.toLowerCase();
      pokemons = pokemons.filter(pokemon => 
        pokemon.tipos.some(t => t.toLowerCase() === tipoTraduzido)
      );

      // Calcula paginação do resultado filtrado
      const totalPages = Math.ceil(pokemons.length / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPokemons = pokemons.slice(startIndex, endIndex);

      return {
        results: paginatedPokemons,
        count: pokemons.length,
        pages: totalPages
      };
    }),
    catchError(err => {
      console.error('Erro ao buscar pokémons:', err);
      return of({ results: [], count: 0, pages: 0 });
    })
  );
}

  toggleFavorite(pokemon: Pokemon): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle_favorite`, pokemon);
  }

  toggleBattleGroup(pokemon: Pokemon): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle_battle_group`, pokemon);
  }

  listPokemonsByType(tipo: string, page: number = 1): Observable<{
    count: number;
    page: number;
    pages: number;
    results: Pokemon[];
  }> {
    const perPage = 12;

    return this.http.get<any>(`https://pokeapi.co/api/v2/type/${tipo}`).pipe(
      switchMap((resp: any) => {
        const allPokemons: string[] = resp.pokemon.map(
          (p: any) => p.pokemon.name
        );

        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedNames = allPokemons.slice(start, end);

        const requests = paginatedNames.map((name) =>
          this.fetchPokemonDetail(name)
        );

        return forkJoin(requests).pipe(
          map((results) => {
            const pokemons = results.filter((p): p is Pokemon => p !== null);
            return {
              count: pokemons.length,
              page,
              pages: Math.ceil(allPokemons.length / perPage),
              results: pokemons,
            };
          })
        );
      }),
      catchError((error: unknown) => {
        return throwError(
          () => new Error('Erro ao listar pokémons por tipo.')
        );
      })
    );
  }

  
  listPokemons(page: number = 1): Observable<{ results: Pokemon[], count: number, pages: number }> {
    const limit = 12;
    const offsetEnd = page * limit;
    let offsetStart = offsetEnd - 12 + 1

    const requests: Observable<Pokemon | null>[] = [];

    while (offsetStart <= offsetEnd) {
      requests.push(this.fetchPokemonDetail(offsetStart));
      offsetStart = offsetStart + 1;
    }
    return forkJoin(requests).pipe(
      map(results => {
        const pokemons = results.filter(p => p !== null) as Pokemon[];
        return {
          results: pokemons,
          count: pokemons.length,
          pages: Math.ceil(905 / limit) 
        };
      })
    );
  }

  getBattleTeam(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(`${this.apiUrl}/battle-team`);
  }

  getFavoritePokemons() {
    return this.http.get<{ total: number; pokemons: Pokemon[] }>(
      `${this.apiUrl}/favorites`
    );
  }


  getTypes(): Observable<string[]> {
    return this.http
      .get<any>(`${this.apiUrl}/types`)
      .pipe(
        map((res) => ['todos', ...res.types])
      );
  }

  

  capturePokemon(data: CapturePokemonRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/capture`, data);
  }

  getMyCollection(): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.apiUrl}/my-collection`);
  }

  getBattleGroup(): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.apiUrl}/battle-group`);
  }

  releasePokemon(pokemonId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${pokemonId}`);
  }

  getFavorites(): Observable<PokemonListResponse> {
    return this.getMyCollection();
  }

  private capitalizarNome(nome: string): string {
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }
}