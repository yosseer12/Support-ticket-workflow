import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type Priority = 'LOW' | 'HIGH' | 'URGENT';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  processInstanceId: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  name: string;
  assignee: string | null;
  ticketId: number;
}

export function errorText(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) { return 'Cannot reach the API. Is the Spring Boot app running on port 8080?'; }
    if (e.status === 401) { return '401: wrong username or password'; }
    if (e.status === 403) { return '403: this user is not allowed to do this'; }
    return e.status + ': ' + (e.error?.message ?? e.statusText);
  }
  return String(e);
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  tickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>('/api/tickets');
  }
  createTicket(body: { title: string; description: string; priority: Priority }): Observable<Ticket> {
    return this.http.post<Ticket>('/api/tickets', body);
  }
  tasks(group: string): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>('/api/tasks', { params: { group } });
  }
  claim(id: string): Observable<void> {
    return this.http.post<void>(`/api/tasks/${id}/claim`, {});
  }
  complete(id: string): Observable<void> {
    return this.http.post<void>(`/api/tasks/${id}/complete`, {});
  }
}
