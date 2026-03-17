
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule], // חובה להוסיף כאן CommonModule כדי שנוכל להשתמש בלולאות ב-HTML
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  /** Injecting the administration service using the modern inject() pattern */
  private adminService = inject(AdminService);

  /** Array to hold the list of pending and processed admin requests */
  requests: any[] = [];

  /**
   * Initializes the component and triggers the loading of all requests.
   */
  ngOnInit() {
    this.loadRequests();
  }

  /**
   * Fetches the current list of admin requests from the server.
   */
  loadRequests() {
    this.adminService.getAdminRequests().subscribe({
      next: (data) => this.requests = data,
      error: (err) => console.error('Failed to load requests', err)
    });
  }

  /**
   * Approves a user's request to become a content editor.
   * @param id The unique ID of the request to approve.
   */
  approve(id: number) {
    this.adminService.updateRequestStatus(id, 'approve').subscribe(() => {
      Swal.fire('אושר!', 'המשתמש שודרג לעורך', 'success');
      this.loadRequests();
    });
  }

  /**
   * Rejects a user's request for administrative permissions.
   * @param id The unique ID of the request to reject.
   */
  reject(id: number) {
    this.adminService.updateRequestStatus(id, 'reject').subscribe(() => {
      Swal.fire('נדחה', 'הבקשה נדחתה', 'info');
      this.loadRequests();
    });
  }

  /**
   * Permanently deletes a request record from the database.
   * Includes a confirmation dialog to prevent accidental deletion.
   * @param id The unique ID of the request to delete.
   */
  deleteReq(id: number) {
    Swal.fire({
      title: 'למחוק מהרשימה?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'כן, מחק'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteRequest(id).subscribe(() => {
          this.loadRequests();
        });
      }
    });
  }
}