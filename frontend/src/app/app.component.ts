import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    nav { display:flex; gap:16px; align-items:center; padding:12px 16px; background:var(--card); border-bottom:1px solid var(--line); }
    nav a { color:var(--muted); text-decoration:none; }
    nav a.active { color:var(--accent); font-weight:600; }
    .brand { font-weight:700; margin-right:8px; }
    .spacer { flex:1; }
  `],
  template: `
    <nav>
      <span class="brand">Support Tickets</span>
      @if (auth.user()) {
        <a routerLink="/tickets" routerLinkActive="active">Tickets</a>
        @if (auth.isStaff()) {
          <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
        }
        <span class="spacer"></span>
        <span class="muted">{{ auth.user() }}</span>
        <button class="ghost" (click)="logout()">Log out</button>
      }
    </nav>
    <main><router-outlet /></main>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
