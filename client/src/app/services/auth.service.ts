
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

const API_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // BehaviorSubject to manage and broadcast the current user state
  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Helper to get the current user value without subscribing.
   */
  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  /**
   * Retrieves the stored user from localStorage. 
   * Includes SSR check to ensure browser-only execution.
   */
  private getStoredUser() {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem(USER_KEY);
      if (user && user !== 'undefined' && user !== 'null') {
        try {
          return JSON.parse(user);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Checks if the user is authenticated. 
   * Typically used for Route Guards.
   */
  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }

  /**
   * authenticates the user and handles the session.
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/login`, { email, password }).pipe(
      tap(response => {
        this.handleAuth(response, email.split('@')[0], email, password);
      })
    );
  }

  /**
   * Registers a new user and automatically logs them in upon success.
   */
  register(username: string, password: string, email: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/register`, { username, password, email }).pipe(
      tap(response => {
        this.handleAuth(response, username, email, password);
      })
    );
  }

  /**
   * Private helper to manage tokens and user data persistence in localStorage.
   */
  private handleAuth(response: any, fallbackName: string, email?: string, password?: string) {
    if (isPlatformBrowser(this.platformId)) {
      const token = response.token || response.access_token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      const imgFromResponse = response.user?.profile_image || response.profile_image || null;

      const user = {
        id: response.user?.id || this.currentUserValue?.id,
        username: response.user?.username || response.username || fallbackName,
        email: response.user?.email || response.email || email || '',
        password: response.user?.password || response.password || password || '',
        role: response.user?.role || response.role || 'user',
        profile_image: imgFromResponse
      };

      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Updates user data in the local state and storage.
   */
  updateLocalUser(updatedUser: any) {
    if (isPlatformBrowser(this.platformId)) {
      const existingUser = this.getStoredUser();
      const newUser = { ...existingUser, ...updatedUser };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      this.currentUserSubject.next(newUser);
    }
  }

  /**
   * Sends profile updates to the server.
   * Note: Auth token is handled automatically by the Interceptor.
   */
  updateUserProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(`${API_URL}/update-profile`, formData); 
  }

  /**
   * Clears session data and logs out the user.
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.currentUserSubject.next(null);
    }
  }
}