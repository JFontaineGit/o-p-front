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
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService, StorageKeys } from '../../../services/core/storage.service';
import { CartService } from '../../../services/carts/cart.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/users/user.service';
import type { Product } from '../../../interfaces/product.interface';
import type { UserMe } from '../../../services/interfaces/user.interfaces';

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

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService,
    private cartService: CartService,
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    // Intentar obtener el carrito del backend primero
    this.cartService.getCart()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.warn('Error getting cart from backend, falling back to storage:', error);
          // Fallback al StorageService si falla el backend
          const cart = this.storageService.getObject<Product[]>(StorageKeys.Carrito);
          this.cartItemCount = cart ? cart.length : 0;
          return of(null);
        })
      )
      .subscribe((cart) => {
        if (cart) {
          this.cartItemCount = cart.items_cnt;
        }
      });
  }

  updateCartItemCount(product: Product) {
    // Intentar agregar al carrito del backend
    const cartItem = {
      availability_id: product.id,
      product_metadata_id: product.id,
      qty: 1,
      unit_price: product.price,
      config: {
        title: product.title,
        description: product.description,
        imageUrl: product.imageUrl
      }
    };

    this.cartService.addCartItem(cartItem)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.warn('Error adding to backend cart, falling back to storage:', error);
          // Fallback al StorageService si falla el backend
          const cart = this.storageService.getObject<Product[]>(StorageKeys.Carrito) || [];
          cart.push(product);
          this.storageService.setObject(StorageKeys.Carrito, cart);
          this.cartItemCount = cart.length;
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.cartItemCount = response.items_cnt;
        }
      });
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
    this.authService.logout().pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.isLoggedIn = false;
        this.cartItemCount = 0;
        this.closeMobileMenu();
        this.router.navigate(['/home']);
        this.snackBar.open('Sesión cerrada exitosamente', 'Cerrar', { duration: 3000 });
      }),
      catchError((error) => {
        console.error('Error al cerrar sesión:', error);
        this.snackBar.open('Error al cerrar sesión', 'Cerrar', { duration: 3000 });
        return of(null);
      })
    ).subscribe();
  }

  toggleLogin() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      this.router.navigate(['/login']);
    }
  }

  getFullName(): string {
    if (this.userData.first_name && this.userData.last_name) {
      return `${this.userData.first_name} ${this.userData.last_name}`;
    } else if (this.userData.first_name) {
      return this.userData.first_name;
    } else if (this.userData.email) {
      return this.userData.email.split('@')[0];
    }
    return 'Usuario';
  }
}