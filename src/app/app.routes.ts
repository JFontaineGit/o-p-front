import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'home', 
                pathMatch: 'full' 
            },
            {
                path: 'home',
                loadComponent: () => import('./components/home/home').then(m => m.Home)
            },
            {
                path: 'packets',
                loadComponent: () => import('./components/packets/packets').then(m => m.Packets)
            },
            {
                path: 'contact',
                loadComponent: () => import('./components/contact/contact').then(m => m.Contact)
            },
            {
                path: 'register',
                loadComponent: () => import('./components/auth/register/register').then(m => m.Register)
            },
            {
                path: 'login',
                loadComponent: () => import('./components/auth/login/login').then(m => m.Login)
            },
            {
                path: 'user_panel',
                loadComponent: () => import('./components/user-panel/user-panel').then(m => m.UserPanel)
            }
        ] // Aquí van las demás rutas hijas

    }
];
