import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, errorText } from './api.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="card">
      <h2>Log in</h2>
      <div class="row">
        <select [(ngModel)]="username" (ngModelChange)="password = $event">
          <option value="customer">customer (creates tickets)</option>
          <option value="agent">agent (support-agents tasks)</option>
          <option value="senior">senior (senior-agents tasks)</option>
          <option value="admin">admin (validates resolution)</option>
        </select>
        <input type="password" [(ngModel)]="password" placeholder="Password">
        <button (click)="submit()">Log in</button>
      </div>
      <p class="muted">Demo users: the password is the same as the username.</p>
      @if (error()) { <p class="err">{{ error() }}</p> }
    </section>
  `
})
export class LoginComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  username = 'customer';
  password = 'customer';
  error = signal('');

  submit(): void {
    this.auth.login(this.username, this.password);
    this.api.tickets().subscribe({
      next: () => this.router.navigate(['/tickets']),
      error: e => { this.auth.logout(); this.error.set(errorText(e)); }
    });
  }
}
