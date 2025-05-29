import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from "jwt-decode";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  account: {
    id: number;
    login: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}
interface DecodedToken {
  id: number;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  register(data: { login: string; password: string; first_name: string; last_name: string; patronymic?: string; }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  login(credentials: { login: string; password: string; }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

  }
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const { exp } = jwtDecode<DecodedToken>(token);
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  }
  setTokens(tokens: AuthResponse): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
  
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const { role } = jwtDecode<DecodedToken>(token);
      return role;
    } catch {
      return null;
    }
  }
}