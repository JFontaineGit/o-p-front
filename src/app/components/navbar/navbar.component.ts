import { Component, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenav } from '@angular/material/sidenav';
import { LoggerService } from '../../services/core/logger.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private destroy$ = new Subject<void>();
  
  isLoggedIn = true;
  cartItemCount = 0;
  isUserMenuOpen = false;
  isMobile = false;
  isTablet = false;

  constructor(
    //private logger: LoggerService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.initializeBreakpoints();
  }

  ngAfterViewInit() {
    if (!this.sidenav) {
      //this.logger.warn('Sidenav not initialized');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeBreakpoints(): void {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        if (this.sidenav && !this.isMobile && this.sidenav.opened) {
          this.sidenav.close();
        }
      });

    this.breakpointObserver
      .observe([Breakpoints.TabletPortrait, Breakpoints.TabletLandscape])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isTablet = result.matches;
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (!this.isMobile && this.sidenav?.opened) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
      //this.logger.debug('Mobile menu toggled', { isOpen: this.sidenav.opened });
    }
  }

  closeMobileMenu(): void {
    if (this.sidenav && this.sidenav.opened) {
      this.sidenav.close();
      //this.logger.debug('Mobile menu closed');
    }
  }

  onUserMenuOpened(): void {
    this.isUserMenuOpen = true;
    //this.logger.debug('User menu opened');
  }

  onUserMenuClosed(): void {
    this.isUserMenuOpen = false;
    //this.logger.debug('User menu closed');
  }

  logout(): void {
    //this.logger.info('Cerrando sesión');
    this.isUserMenuOpen = false;
    this.closeMobileMenu();
    this.isLoggedIn = false;
    this.cartItemCount = 0;
    //this.logger.debug('Simulated navigation to /login');
  }
}