import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID  } from '@angular/core';
import { isPlatformBrowser} from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Language, Currency, FooterLink, ContactInfo } from '../../../interfaces/footer.interface';
import { StorageService, StorageKeys } from '../../../services/core/storage.service'; // Ajusta la ruta

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  // Formulario de newsletter
  newsletterForm: FormGroup;
  isNewsletterLoading = false;
  newsletterMessage = '';

  // Selectores de idioma y moneda
  languages: Language[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  selectedLanguage: Language = this.languages[0];
  selectedCurrency: Currency = this.currencies[2]; // ARS por defecto
  isLanguageDialogOpen = false;
  isCurrencyDialogOpen = false;

  // Enlaces del footer organizados por sección
  destinationLinks: FooterLink[] = [
    { label: 'París', route: '/destinos/paris' },
    { label: 'Londres', route: '/destinos/londres' },
    { label: 'Tokio', route: '/destinos/tokio' },
    { label: 'Roma', route: '/destinos/roma' },
    { label: 'Seattle', route: '/destinos/seattle' },
    { label: 'San Francisco', route: '/destinos/san-francisco' },
  ];

  serviceLinks: FooterLink[] = [
    { label: 'Alojamientos', route: '/alojamientos' },
    { label: 'Paquetes Turísticos', route: '/paquetes' },
    { label: 'Experiencias', route: '/experiencias' },
    { label: 'Vuelos', route: '/vuelos' },
  ];

  supportLinks: FooterLink[] = [
    { label: 'Centro de Ayuda', route: '/ayuda' },
    { label: 'Contacto', route: '/contacto' },
    { label: 'Política de Cancelación', route: '/cancelacion' },
    { label: 'Términos y Condiciones', route: '/terminos' },
    { label: 'Privacidad', route: '/privacidad' },
    { label: 'Seguridad', route: '/seguridad' },
  ];

  // Información de contacto
  contactInfo: ContactInfo[] = [
    { icon: 'phone', text: '+34 900 123 456', href: 'tel:+34900123456' },
    { icon: 'email', text: 'info@airipet57.com', href: 'mailto:info@airipet57.com' },
    { icon: 'location_on', text: 'Madrid, España' },
  ];

  // Redes sociales
  socialLinks = [
    { icon: 'facebook', url: 'https://facebook.com', label: 'Facebook' },
    { icon: 'camera_alt', url: 'https://instagram.com', label: 'Instagram' },
    { icon: 'play_circle_outline', url: 'https://youtube.com', label: 'YouTube' },
  ];

  // Métodos de pago (usando Material Icons)
  paymentMethods = [
    { icon: 'credit_card', label: 'Visa' },
    { icon: 'credit_card', label: 'Mastercard' },
    { icon: 'account_balance', label: 'PayPal' },
    { icon: 'phone_android', label: 'Apple Pay' },
  ];

  private isBrowser = false;

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadUserPreferences();
    }
  }

  ngOnDestroy() {
    // Limpiar subscripciones si las hay
  }

  // Newsletter
  async onNewsletterSubmit() {
    if (this.newsletterForm.valid) {
      this.isNewsletterLoading = true;
      const email = this.newsletterForm.get('email')?.value;

      try {
        // Simular llamada a API
        await this.simulateNewsletterSubscription(email);
        this.newsletterMessage = '¡Gracias por suscribirte! Recibirás nuestras mejores ofertas.';
        this.newsletterForm.reset();
      } catch (error) {
        this.newsletterMessage = 'Error al suscribirse. Inténtalo de nuevo.';
      } finally {
        this.isNewsletterLoading = false;
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          this.newsletterMessage = '';
        }, 5000);
      }
    }
  }

  private simulateNewsletterSubscription(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Newsletter subscription:', email);
        resolve();
      }, 1500);
    });
  }

  // Selectores de idioma y moneda
  openLanguageDialog() {
    this.isLanguageDialogOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLanguageDialog() {
    this.isLanguageDialogOpen = false;
    document.body.style.overflow = 'auto';
  }

  selectLanguage(language: Language) {
    this.selectedLanguage = language;
    this.closeLanguageDialog();
    if (this.isBrowser) {
      this.saveUserPreferences();
    }
    console.log('Language selected:', language.name);
  }

  openCurrencyDialog() {
    this.isCurrencyDialogOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCurrencyDialog() {
    this.isCurrencyDialogOpen = false;
    document.body.style.overflow = 'auto';
  }

  selectCurrency(currency: Currency) {
    this.selectedCurrency = currency;
    this.closeCurrencyDialog();
    if (this.isBrowser) {
      this.saveUserPreferences();
    }
    console.log('Currency selected:', currency.code);
  }

  // Persistencia de preferencias
  private loadUserPreferences() {
    /*
    const preferences = this.storageService.getObject<{ selectedLanguage: string; selectedCurrency: string }>(StorageKeys.UserPreferences);
    if (preferences) {
      const language = this.languages.find((l) => l.code === preferences.selectedLanguage);
      if (language) this.selectedLanguage = language;
      const currency = this.currencies.find((c) => c.code === preferences.selectedCurrency);
      if (currency) this.selectedCurrency = currency;
    }
    */
    const preferences = {
      selectedLanguage: 'es', // Simulación de carga (por ahora)
      selectedCurrency: 'EUR', // Simulación de carga (por ahora)
    };
  }

  private saveUserPreferences() {
    const preferences = {
      selectedLanguage: this.selectedLanguage.code,
      selectedCurrency: this.selectedCurrency.code,
    };
    //this.storageService.setObject(StorageKeys.UserPreferences, preferences);
  }

  // Getters para el formulario
  get emailControl() {
    return this.newsletterForm.get('email');
  }

  get isEmailInvalid() {
    return this.emailControl?.invalid && this.emailControl?.touched;
  }

  // Año actual para el copyright
  get currentYear() {
    return new Date().getFullYear();
  }
}