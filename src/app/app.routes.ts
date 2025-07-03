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
                path: 'register',
                loadComponent: () => import('./components/auth/register/register').then(m => m.Register)
            },
            {
                path: 'login',
                loadComponent: () => import('./components/auth/login/login').then(m => m.Login)
            }
        ] // Aquí van las demás rutas hijas

    }
];
