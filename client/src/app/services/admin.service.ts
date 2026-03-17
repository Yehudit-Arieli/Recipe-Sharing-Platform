
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private http = inject(HttpClient);
  private API_URL = 'http://127.0.0.1:5000/api';

  /**
   * Submits a request to the server for administrative permissions.
   */
  requestPermission(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/request-permission`, {});
  }

  /**
   * Fetches all pending administrative or membership requests.
   */
  getAdminRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/admin/requests`);
  }

  /**
   * Updates the status of a specific request (Approve or Reject).
   * @param requestId The ID of the request to update.
   * @param action The action to perform: 'approve' or 'reject'.
   */
  updateRequestStatus(requestId: number, action: 'approve' | 'reject'): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/admin/update-request/${requestId}`, { action });
  }

  /**
   * Deletes a specific request by its ID.
   */
  deleteRequest(requestId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/admin/delete-request/${requestId}`);
  }
}