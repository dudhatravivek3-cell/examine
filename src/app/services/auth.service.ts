import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://192.168.1.130:5000/api/auth';
  
  // Standalone signal to manage reactive admin user state
  public currentUser = signal<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        this.currentUser.set(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    }
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, data).pipe(
      tap((res) => {
        if (res.status === 'success' && res.data.token) {
          localStorage.setItem('admin_token', res.data.token);
          localStorage.setItem('admin_user', JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, { username, password }).pipe(
      tap((res) => {
        if (res.status === 'success' && res.data.token) {
          localStorage.setItem('admin_token', res.data.token);
          localStorage.setItem('admin_user', JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  isAdmin(): boolean {
    const u = this.currentUser();
    return u && u.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}
