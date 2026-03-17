
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);

  user: any = null;
  activeTab: string = 'settings';
  showEditModal: boolean = false;
  editData = { username: '', password: '' };
  selectedFile: File | null = null;

  /**
   * Initializes the profile component and subscribes to current user updates
   * to ensure the view stays in sync with the authentication state.
   */
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(userData => {
      this.user = userData;
      console.log('User data updated in component:', this.user);
    });
  }

  /**
   * Returns a localized description of the user's role and its permissions.
   * @returns {string} Explanatory text for the current user role.
   */
  getRoleDescription(): string {
    if (!this.user) return '';
    switch (this.user.role) {
      case 'admin': return 'יש לך הרשאות ניהול מלאות. ביכולתך לאשר משתמשים להפוך להיות משתמשי תוכן וכן להעלות מתכונים.';
      case 'editor': return 'אתה משתמש תוכן מורשה! באפשרוך להוסיף מתכונים למערכת.';
      default: return ' כרגע אתה משתמש רגיל ואינך רשאי להוסיף מתכונים. באפשרותך  לשדרג את חשבונך למשתמש תוכן על ידי שליחת בקשה למנהל המערכת.';
    }
  }

  /**
   * Prepares and opens the edit modal with current user data.
   */
  openEditModal() {
    this.editData = { username: this.user?.username || '', password: '' };
    this.selectedFile = null;
    this.showEditModal = true;
  }

  /**
   * Handles file selection for the profile image.
   * @param event The file input change event.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  /**
   * Sends the updated profile information to the server using FormData.
   * On success, updates the local user state and handles cache busting for the profile image.
   */
  saveProfileChanges() {
    const formData = new FormData();
    formData.append('username', this.editData.username);

    const passwordToSend = this.editData.password || this.user.password;
    formData.append('password', passwordToSend);

    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.authService.updateUserProfile(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.showEditModal = false;

          const updatedUserData = {
            ...this.user, // שמירה על נתונים שלא השתנו כמו אימייל ו-ID
            username: res.user.username,
            password: passwordToSend,
            profile_image: res.user.profile_image ? `${res.user.profile_image}?t=${new Date().getTime()}` : null
          };

          this.authService.updateLocalUser(updatedUserData);
          Swal.fire('עודכן!', 'הפרופיל עודכן בהצלחה', 'success');
        }
      },
      error: (err) => {
        console.error('Update error:', err);
        Swal.fire('שגיאה', 'השרת לא הצליח לעדכן את הפרטים', 'error');
      }
    });
  }
}