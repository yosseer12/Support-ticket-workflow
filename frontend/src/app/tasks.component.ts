import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, TaskItem, errorText } from './api.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="card">
      <div class="row between">
        <h2>Open tasks</h2>
        <div class="row">
          <select [(ngModel)]="group" (ngModelChange)="load()">
            <option>support-agents</option>
            <option>senior-agents</option>
            <option>admins</option>
          </select>
          <button class="ghost" (click)="load()">Refresh</button>
        </div>
      </div>
      <div class="wrap">
        <table>
          <thead><tr><th>Ticket</th><th>Task</th><th>Assignee</th><th></th></tr></thead>
          <tbody>
            @for (t of tasks(); track t.id) {
              <tr>
                <td>#{{ t.ticketId }}</td>
                <td>{{ t.name }}</td>
                <td>{{ t.assignee ?? '-' }}</td>
                <td class="row">
                  <button class="ghost" (click)="claim(t)">Claim</button>
                  <button (click)="complete(t)">Complete</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="muted">No open tasks for this group</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (message()) { <p [class.err]="isError()">{{ message() }}</p> }
    </section>
  `
})
export class TasksComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  tasks = signal<TaskItem[]>([]);
  message = signal('');
  isError = signal(false);
  group = 'support-agents';

  ngOnInit(): void {
    const defaults: Record<string, string> = { agent: 'support-agents', senior: 'senior-agents', admin: 'admins' };
    this.group = defaults[this.auth.user() ?? ''] ?? this.group;
    this.load();
  }

  load(): void {
    this.api.tasks(this.group).subscribe({
      next: list => { this.tasks.set(list); this.isError.set(false); this.message.set(''); },
      error: e => this.fail(e)
    });
  }

  claim(t: TaskItem): void {
    this.api.claim(t.id).subscribe({
      next: () => this.done('Task claimed, ticket is IN_PROGRESS'),
      error: e => this.fail(e)
    });
  }

  complete(t: TaskItem): void {
    this.api.complete(t.id).subscribe({
      next: () => this.done('Task completed, the process moved on'),
      error: e => this.fail(e)
    });
  }

  private done(text: string): void {
    this.load();
    this.isError.set(false);
    this.message.set(text);
  }

  private fail(e: unknown): void {
    this.isError.set(true);
    this.message.set(errorText(e));
  }
}
