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
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/users/user.service';
import { CartService } from '../../../services/carts/cart.service';
import { StorageService, StorageKeys } from '../../../services/core/storage.service';
import { LoggerService } from '../../../services/core/logger.service';
import type { UserMe } from '../../../services/interfaces/user.interfaces';
import type { CartItemConfig, CartItemAdd } from '../../../services/interfaces/cart.interfaces';
import type { ProductMetadataResponse, Activity, Transportation, Lodgment, Flight } from '../../../services/interfaces/product.interfaces'
import { Subject, Observable, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

interface AuthState {
  isLoggedIn: boolean;
  user: UserMe | null;
}

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
  animations: [
    trigger('badgeAnimation', [
      transition(':increment, :decrement', [
        style({ transform: 'scale(1.2)' }),
        animate('200ms ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isLoading = true; // Estado de carga inicial
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
    private authService: AuthService,
    private userService: UserService,
    private cartService: CartService,
    private loggerService: LoggerService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkScreenSize();
      this.initializeAuthState();
      // initializeCart se llama después de resolver el estado de autenticación
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
    this.loggerService.debug('Tamaño de pantalla verificado', { isMobile: this.isMobile });
  }

  private initializeAuthState() {
    this.authService.getAuthState().pipe(
      takeUntil(this.destroy$),
      switchMap((authState: AuthState) => {
        this.isLoggedIn = authState.isLoggedIn;
        this.loggerService.debug('Estado de autenticación inicial', { authState });

        if (authState.isLoggedIn && authState.user) {
          this.userData = { ...authState.user };
          this.loggerService.debug('Datos del usuario cargados', { user: authState.user });
          return this.initializeCart();
        } else if (authState.isLoggedIn) {
          // Cargar datos del usuario si está autenticado pero no hay userData
          return this.userService.getMe().pipe(
            tap((user: UserMe | null) => {
              if (user) {
                this.userData = { ...user };
                this.authService.updateAuthState({ isLoggedIn: true, user });
                this.loggerService.debug('Datos del usuario obtenidos', { user });
              } else {
                this.authService.logout().subscribe();
                this.isLoggedIn = false;
                this.router.navigate(['/login']);
                this.snackBar.open('Sesión inválida, por favor inicia sesión nuevamente', 'Cerrar', { duration: 3000 });
                this.loggerService.debug('Sesión inválida, redirigiendo a login');
              }
            }),
            switchMap(() => this.initializeCart()),
            catchError((error) => {
              this.loggerService.error('Error al cargar datos del usuario', error);
              this.authService.logout().subscribe();
              this.isLoggedIn = false;
              this.router.navigate(['/login']);
              this.snackBar.open('Error al cargar datos del usuario', 'Cerrar', { duration: 3000 });
              return this.initializeCart();
            })
          );
        } else {
          this.isLoggedIn = false;
          return this.initializeCart();
        }
      })
    ).subscribe(() => {
      this.isLoading = false;
      this.loggerService.debug('Inicialización completada', { isLoggedIn: this.isLoggedIn, cartItemCount: this.cartItemCount });
    });
  }

  private initializeCart(): Observable<void> {
    if (this.isLoggedIn) {
      return this.cartService.getCart().pipe(
        takeUntil(this.destroy$),
        tap((cart) => {
          this.cartItemCount = cart?.items_cnt || 0;
          this.loggerService.debug('Carrito cargado desde el backend', { cart });
        }),
        catchError((error) => {
          this.loggerService.error('Error al cargar el carrito', error);
          this.cartItemCount = 0;
          return of(null);
        }),
        switchMap(() => of(void 0))
      );
    } else {
      const cart = this.storageService.getObject<ProductMetadataResponse[]>(StorageKeys.Carrito) || [];
      this.cartItemCount = cart.length;
      this.loggerService.debug('Carrito cargado desde almacenamiento local', { cart });
      return of(void 0);
    }
  }

  updateCartItemCount(product: ProductMetadataResponse) {
    if (this.isLoggedIn) {
      // Determinar availability_id según el tipo de producto
      let availability_id = 0;
      let title = 'Producto sin nombre';
      let description = 'Sin descripción';

      switch (product.product_type) {
        case 'activity':
          const activity = product.product as Activity;
          availability_id = activity.availability_id?.[0]?.id || 0;
          title = activity.name || title;
          description = activity.description || description;
          break;
        case 'lodgment':
          const lodgment = product.product as Lodgment;
          availability_id = lodgment.rooms?.[0]?.availabilities?.[0]?.id || 0;
          title = lodgment.name || title;
          description = lodgment.description || description;
          break;
        case 'transportation':
          const transportation = product.product as Transportation;
          availability_id = transportation.availability_id?.[0]?.id || 0;
          title = `${transportation.type} ${transportation.origin.city} a ${transportation.destination.city}` || title;
          description = transportation.description || description;
          break;
        case 'flight':
          const flight = product.product as Flight;
          availability_id = flight.availability_id || 0;
          title = `${flight.flight_number} ${flight.origin.city} a ${flight.destination.city}` || title;
          description = flight.notes || description;
          break;
      }

      if (availability_id === 0) {
        this.loggerService.error('No se encontró availability_id válido para el producto', { product });
        this.snackBar.open('No se puede agregar el producto al carrito: disponibilidad no encontrada', 'Cerrar', { duration: 3000 });
        return;
      }

      const cartItem: CartItemAdd = {
        availability_id,
        product_metadata_id: product.id,
        qty: 1,
        unit_price: product.unit_price,
        currency: product.currency,
        config: {
          title,
          description,
          imageUrl: product.images?.[0]?.image || '',
        },
      };

      this.cartService.addCartItem(cartItem).pipe(
        takeUntil(this.destroy$),
        tap((cart) => {
          this.cartItemCount = cart?.items_cnt || 0;
          this.loggerService.debug('Carrito actualizado en el backend', { cartId: cart?.id, items_cnt: this.cartItemCount, item: cartItem });
        }),
        catchError((error) => {
          this.loggerService.error('Error al actualizar el carrito', error);
          this.snackBar.open('Error al actualizar el carrito', 'Cerrar', { duration: 3000 });
          return of(null);
        })
      ).subscribe();
    } else {
      const cart = this.storageService.getObject<ProductMetadataResponse[]>(StorageKeys.Carrito) || [];
      cart.push(product);
      this.storageService.setObject(StorageKeys.Carrito, cart);
      this.cartItemCount = cart.length;
      this.loggerService.debug('Carrito actualizado en almacenamiento local', { cart });
    }
  }

  toggleMobileMenu() {
    if (this.sidenav) {
      this.sidenav.toggle();
      this.loggerService.debug('Menú móvil toggled', { opened: this.sidenav.opened });
    }
  }

  closeMobileMenu() {
    if (this.sidenav?.opened) {
      this.sidenav.close();
      this.loggerService.debug('Menú móvil cerrado');
    }
  }

  onUserMenuOpened() {
    this.isUserMenuOpen = true;
    this.loggerService.debug('Menú de usuario abierto');
  }

  onUserMenuClosed() {
    this.isUserMenuOpen = false;
    this.loggerService.debug('Menú de usuario cerrado');
  }

  logout() {
    this.authService.logout().pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.isLoggedIn = false;
        this.storageService.removeItem(StorageKeys.Carrito);
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
        this.loggerService.debug('Sesión cerrada, estado de autenticación actualizado');
      }),
      catchError((error) => {
        this.loggerService.error('Error al cerrar sesión', error);
        this.snackBar.open('Error al cerrar sesión', 'Cerrar', { duration: 3000 });
        return of(null);
      })
    ).subscribe();
  }

  // Eliminar en producción
  toggleLogin() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      this.authService.login({ email: 'test@example.com', password: 'test123' }).pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          this.isLoggedIn = true;
          this.initializeAuthState();
          this.loggerService.debug('Inicio de sesión simulado exitoso');
          this.snackBar.open('Inicio de sesión simulado', 'Cerrar', { duration: 3000 });
        }),
        catchError((error) => {
          this.loggerService.error('Error en login simulado', error);
          this.snackBar.open('Error en login simulado', 'Cerrar', { duration: 3000 });
          return of(null);
        })
      ).subscribe();
    }
  }

  getFullName(): string {
    return `${this.userData.first_name} ${this.userData.last_name}`.trim();
  }
}