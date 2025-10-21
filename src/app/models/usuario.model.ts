export interface Usuario {
  id: number;
  nome: string;
  login: string;
  email: string;
  role: string;
  dt_inclusao?: string;
  dt_alteracao?: string;
  total_pokemons?: number;
}

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  user?: Usuario;
}

export interface JwtPayload {
  sub: string;
  roles: string[];
  exp: number;
}

export interface RegisterRequest {
  nome: string;
  login: string;
  email: string;
  senha: string;
}

export interface UpdateProfileRequest {
  nome?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  senha_atual: string;
  senha_nova: string;
}

export interface UserStats {
  total_pokemons: number;
  favoritos: number;
  grupo_batalha: number;
  tipo_favorito: string | null;
  tipos_capturados: { [key: string]: number };
}