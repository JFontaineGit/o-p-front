import { Component, ViewChild, OnInit, OnDestroy, HostListener, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/users/user.service'; 
import { StorageService, StorageKeys } from '../../../services/core/storage.service';
import type { Product } from '../../../interfaces/product.interface';
import type { UserMe } from '../../../services/interfaces/user.interfaces';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatDividerModule,
    MatBadgeModule,
    MatSnackBarModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isLoggedIn = false;
  cartItemCount = 0;
  isMobile = false;
  isUserMenuOpen = false;
  isBrowser = false;

  userData: UserMe = {
    id: 0,
    first_name: 'Usuario',
    last_name: '',
    email: 'usuario@email.com',
    telephone: '',
    state: '',
    created_at: '',
    is_staff: false,
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkScreenSize();
      this.initializeAuthState();
      this.initializeCart();
    }
  }

  ngOnDestroy() {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile && this.sidenav?.opened) {
      this.sidenav.close();
    }
  }

  private initializeAuthState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadUserData();
    }
  }

  private loadUserData() {
    this.userService.getMe().pipe(
      tap((user: UserMe | null) => {
        if (user) {
          this.userData = user;
        } else {
          this.authService.logout().subscribe();
          this.isLoggedIn = false;
          this.router.navigate(['/login']);
          this.snackBar.open('Sesión inválida, por favor inicia sesión nuevamente', 'Cerrar', { duration: 3000 });
        }
      }),
      catchError((error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.authService.logout().subscribe();
        this.isLoggedIn = false;
        this.router.navigate(['/login']);
        this.snackBar.open('Error al cargar datos del usuario', 'Cerrar', { duration: 3000 });
        return of(null);
      })
    ).subscribe();
  }

  private initializeCart() {
    const cart = this.storageService.getObject<Product[]>(StorageKeys.Carrito);
    this.cartItemCount = cart ? cart.length : 0;
  }

  updateCartItemCount(product: Product) {
    const cart = this.storageService.getObject<Product[]>(StorageKeys.Carrito) || [];
    cart.push(product);
    this.storageService.setObject(StorageKeys.Carrito, cart);
    this.cartItemCount = cart.length;
    console.log('Carrito actualizado:', cart);
  }

  toggleMobileMenu() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  closeMobileMenu() {
    if (this.sidenav?.opened) {
      this.sidenav.close();
    }
  }

  onUserMenuOpened() {
    this.isUserMenuOpen = true;
  }

  onUserMenuClosed() {
    this.isUserMenuOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.cartItemCount = 0;
        this.userData = {
          id: 0,
          first_name: 'Usuario',
          last_name: '',
          email: 'usuario@email.com',
          telephone: '',
          state: '',
          created_at: '',
          is_staff: false,
        };
        this.closeMobileMenu();
        this.router.navigate(['/login']);
        this.snackBar.open('Sesión cerrada correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.snackBar.open('Error al cerrar sesión', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Solo para depuración, eliminar en producción
  toggleLogin() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      this.authService.login({ email: 'test@example.com', password: 'test123' }).subscribe({
        next: (response) => {
          this.isLoggedIn = true;
          this.loadUserData();
          this.snackBar.open('Inicio de sesión simulado', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error en login simulado:', error);
          this.snackBar.open('Error en login simulado', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  // Método para combinar first_name y last_name
  getFullName(): string {
    return `${this.userData.first_name} ${this.userData.last_name}`.trim();
  }
}