import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Priority, Ticket, errorText } from './api.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="card">
      <h2>Create a ticket</h2>
      <div class="row">
        <input [(ngModel)]="title" placeholder="Title (e.g. VPN down)">
        <select [(ngModel)]="priority">
          <option>LOW</option><option>HIGH</option><option>URGENT</option>
        </select>
      </div>
      <div class="row top">
        <textarea [(ngModel)]="description" rows="2" placeholder="Description"></textarea>
        <button (click)="create()" [disabled]="!title.trim()">Create ticket</button>
      </div>
      @if (message()) { <p [class.err]="isError()">{{ message() }}</p> }
    </section>

    <section class="card">
      <div class="row between">
        <h2>Tickets</h2>
        <button class="ghost" (click)="load()">Refresh</button>
      </div>
      <div class="wrap">
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            @for (t of tickets(); track t.id) {
              <tr>
                <td>{{ t.id }}</td>
                <td>{{ t.title }}</td>
                <td>{{ t.priority }}</td>
                <td><span [class]="'badge ' + t.status">{{ t.status }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="muted">No tickets yet</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class TicketsComponent implements OnInit {
  private api = inject(ApiService);

  tickets = signal<Ticket[]>([]);
  message = signal('');
  isError = signal(false);

  title = '';
  description = '';
  priority: Priority = 'URGENT';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.tickets().subscribe({
      next: list => this.tickets.set(list),
      error: e => this.fail(e)
    });
  }

  create(): void {
    this.api.createTicket({ title: this.title, description: this.description, priority: this.priority }).subscribe({
      next: t => {
        this.isError.set(false);
        this.message.set(`Ticket #${t.id} created, process ${t.processInstanceId} started`);
        this.title = '';
        this.description = '';
        this.load();
      },
      error: e => this.fail(e)
    });
  }

  private fail(e: unknown): void {
    this.isError.set(true);
    this.message.set(errorText(e));
  }
}
