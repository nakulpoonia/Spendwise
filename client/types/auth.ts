export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  currency: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  currency: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  currency: string;
}