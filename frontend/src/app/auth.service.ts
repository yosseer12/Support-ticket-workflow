import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';

/** Demo auth: keeps HTTP Basic credentials in memory (lost on refresh). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private creds = signal<{ user: string; pass: string } | null>(null);

  readonly user = computed(() => this.creds()?.user ?? null);
  /** agent, senior and admin can see the tasks screen; customer cannot. */
  readonly isStaff = computed(() => {
    const u = this.user();
    return u !== null && u !== 'customer';
  });

  login(user: string, pass: string): void { this.creds.set({ user, pass }); }
  logout(): void { this.creds.set(null); }

  authHeader(): string | null {
    const c = this.creds();
    return c ? 'Basic ' + btoa(c.user + ':' + c.pass) : null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const header = inject(AuthService).authHeader();
  if (!header) { return next(req); }
  return next(req.clone({
    setHeaders: { Authorization: header, 'X-Requested-With': 'XMLHttpRequest' }
  }));
};

export const authGuard: CanActivateFn = () =>
  inject(AuthService).user() ? true : inject(Router).createUrlTree(['/login']);

export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.user()) { return inject(Router).createUrlTree(['/login']); }
  return auth.isStaff() ? true : inject(Router).createUrlTree(['/tickets']);
};
