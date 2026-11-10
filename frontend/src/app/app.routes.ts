import { Routes } from '@angular/router';
import { authGuard, staffGuard } from './auth.service';
import { LoginComponent } from './login.component';
import { TasksComponent } from './tasks.component';
import { TicketsComponent } from './tickets.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'tickets', component: TicketsComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [staffGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  { path: '**', redirectTo: 'tickets' }
];
