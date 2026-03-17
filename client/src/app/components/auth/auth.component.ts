
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  /** Injecting core services using the modern inject() pattern */
  authService = inject(AuthService);
  router = inject(Router);

  /** Form data bound via ngModel */
  email = '';
  username = '';
  password = '';

  /** Flag to switch between Login and Register modes */
  isLoginMode = true;

  /** Loading state to prevent multiple submissions */
  isLoading = false;

  /**
   * On initialization, check the URL to determine if the user
   * intended to go directly to the registration page.
   */
  ngOnInit() {
    this.isLoginMode = !this.router.url.includes('register');
  }

  /**
     * Handles the form submission for both Login and Registration.
     * Dynamically calls the appropriate service method based on isLoginMode.
     */
  onSubmit() {
    this.isLoading = true;

    // Determine the action based on the current mode
    const action = this.isLoginMode
      ? this.authService.login(this.email, this.password)
      : this.authService.register(this.username, this.password, this.email);

    action.subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'הצלחה!',
          text: this.isLoginMode ? 'נכנסת למערכת בהצלחה' : 'נרשמת למערכת בהצלחה',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('שגיאה', err.error?.message || 'פעולה נכשלה', 'error');
      }
    });
  }

  /** Switches between Login and Register modes visually */
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
}