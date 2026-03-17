
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { AdminService } from '../../services/admin.service'; // <--- ייבוא השירות החדש
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  // Injection of core services
  authService = inject(AuthService);
  recipeService = inject(RecipeService);
  adminService = inject(AdminService); // <--- הזרקת השירות החדש
  router = inject(Router);

  /** Observable stream of the current user data from the auth service */
  user$ = this.authService.currentUser$;

  /**
   * Updates the global search term in the recipe service.
   * Redirects the user to the recipes page if they are elsewhere.
   * @param event The input change event from the search bar.
   */
  onSearchChange(event: any) {
    const term = event.target.value;
    this.recipeService.updateSearchTerm(term);

    // Ensure the user is on the recipes page to see filtered results
    if (this.router.url !== '/recipes') {
      this.router.navigate(['/recipes']);
    }
  }

  /**
   * Logs out the current user and redirects to the login page.
   */
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Sends a request to the admin to upgrade the current user's permissions (to Editor).
   * Displays a SweetAlert notification based on the server response.
   */
  requestPermission() {
    this.adminService.requestPermission().subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'בקשת הרשאה',
          text: res.message,
          icon: res.status === 'success' ? 'success' : 'info',
          confirmButtonText: 'הבנתי'
        });
      },
      error: (err: any) => {
        Swal.fire('שים לב', err.error?.message || 'חלה שגיאה בשליחת הבקשה', 'error');
      }
    });
  }
}
