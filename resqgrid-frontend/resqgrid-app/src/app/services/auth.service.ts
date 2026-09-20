import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';

export type UserRole = 'RESIDENT' | 'CAMP_WORKER' | 'FIELD_COORDINATOR' | 'DISTRICT_COORDINATOR' | 'NATIONAL_COORDINATOR';

export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'aidlinkx-auth-session';
  private readonly legacyKey = 'resqgrid-auth-session';
  private readonly authUrl = `${API_BASE_URL}/auth`;

  constructor(private http: HttpClient) {}

  get session(): AuthResponse | null {
    const stored = localStorage.getItem(this.storageKey) || localStorage.getItem(this.legacyKey);
    if (!stored) return null;
    try {
      const session = JSON.parse(stored) as AuthResponse;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  get currentUser(): AuthUser | null { return this.session?.user ?? null; }
  get isSignedIn(): boolean { return this.session !== null; }
  get isCoordinator(): boolean {
    const role = this.currentUser?.role;
    return role === 'FIELD_COORDINATOR' || role === 'DISTRICT_COORDINATOR' || role === 'NATIONAL_COORDINATOR';
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  get authOptions(): { headers: HttpHeaders } {
    const token = this.session?.token;
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : { headers: new HttpHeaders() };
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, request)
      .pipe(tap(response => this.saveSession(response)));
  }

  login(identifier: string, password: string, requestedRole?: UserRole, securityKey?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, {
      identifier, password, requestedRole, securityKey
    }).pipe(tap(response => this.saveSession(response)));
  }

  logout(): void {
    const options = this.authOptions;
    this.clearSession();
    this.http.delete(`${this.authUrl}/logout`, options).subscribe({ error: () => undefined });
  }

  private saveSession(session: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private clearSession(): void { localStorage.removeItem(this.storageKey); }
}
