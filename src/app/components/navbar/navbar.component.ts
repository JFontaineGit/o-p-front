import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { LoggerService } from '../../services/core/logger.service';

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
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isLoggedIn = true;
  cartItemCount = 0;
  isUserMenuOpen = false;
  isMobile = false;

  constructor(
    private logger: LoggerService,
    private bp: BreakpointObserver
  ) {
    this.bp.observe([Breakpoints.Handset]).subscribe(res => {
      this.isMobile = res.matches;
      if (this.sidenav && !this.isMobile && this.sidenav.opened) {
        this.sidenav.close();
      }
    });
  }

  ngAfterViewInit() {
    if (!this.sidenav) {
    }
  }

  toggleMobileMenu(): void {
    if (this.isMobile && this.sidenav) {
      this.sidenav.toggle();
      if (this.sidenav.opened || !this.isMobile) {
        this.isUserMenuOpen = false; 
      }
    }
  }

  closeMobileMenu(): void {
    if (this.sidenav) {
      this.sidenav.close();
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.logger.debug('User menu toggled', { isOpen: this.isUserMenuOpen });
    if (this.isUserMenuOpen && this.sidenav && this.sidenav.opened) {
      this.closeMobileMenu();
    }
  }

  logout(): void {
    this.logger.info('Cerrando sesión');
    this.isUserMenuOpen = false;
    this.closeMobileMenu();
    this.logger.debug('Simulated navigation to /login');
  }
}