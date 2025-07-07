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
                canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)],
                loadComponent: () => import('./components/user-panel/user-panel').then(m => m.UserPanel)
            },
            {
                path: 'cart',
                canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)],
                loadComponent: () => import('./components/cart/cart').then(m => m.CartComponent)
            },
            {
                path: 'checkout/success',
                loadComponent: () => import('./components/checkout/checkout-success').then(m => m.CheckoutSuccess)
            },
            {
                path: 'checkout/cancel',
                loadComponent: () => import('./components/checkout/checkout-cancel').then(m => m.CheckoutCancel)
            }
        ] // Aquí van las demás rutas hijas

    }
];
