import { Component, ViewChild, OnInit, OnDestroy, HostListener, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { StorageService, StorageKeys } from '../../../services/core/storage.service'; 
import { CartService } from '../../../services/carts/cart.service';
import type { Product } from '../../../interfaces/product.interface'; 

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
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isLoggedIn = false;
  cartItemCount = 0; // Inicializamos en 0, se actualizará en ngOnInit
  isMobile = false;
  isUserMenuOpen = false;
  isBrowser = false;

  userData = {
    name: 'Usuario',
    email: 'usuario@email.com',
    avatar: null as string | null,
  };

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService,
    private cartService: CartService
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
    const token = this.storageService.getToken();
    this.isLoggedIn = !!token; // true si hay token, false si no
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
    this.isLoggedIn = false;
    this.storageService.clearStorage(); // Limpia el token y el carrito
    this.cartItemCount = 0; // Resetea el contador del carrito
    this.closeMobileMenu();
    console.log('Usuario deslogueado');
  }

  toggleLogin() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      // Simulamos un login (puedes integrar un servicio de autenticación real)
      this.storageService.setToken('fake-token');
      this.isLoggedIn = true;
      console.log('Usuario logueado');
    }
  }
}