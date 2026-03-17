
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
/**
 * Guard to protect routes from unauthorized access.
 * Redirects unauthenticated users to the login page.
 */
export class AuthGuard {
    private authService = inject(AuthService);
    private router = inject(Router);

    /**
     * Determines if a route can be activated based on user authentication status.
     * @returns An Observable of boolean indicating access permission.
     */
    canActivate(): Observable<boolean> {
        return this.authService.isLoggedIn().pipe(
            map(isLogged => {
                if (!isLogged) {
                    this.router.navigate(['/login']);
                    return false;
                }
                return true;
            })
        );
    }
}