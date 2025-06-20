import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LoggerService } from '../../services/core/logger.service';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  // Static
  languages: Language[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇳' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  // Static
  currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  ];

  selectedLanguage: Language = this.languages[0]; // Default: Español
  selectedCurrency: Currency = this.currencies[0]; // Default: ARS

  isLanguageDialogOpen = false;
  isCurrencyDialogOpen = false;

  constructor(private logger: LoggerService) {}

  openLanguageDialog(): void {
    this.isLanguageDialogOpen = true;
    this.logger.debug('Language dialog opened');
  }

  closeLanguageDialog(): void {
    this.isLanguageDialogOpen = false;
    this.logger.debug('Language dialog closed');
  }

  selectLanguage(language: Language): void {
    this.selectedLanguage = language;
    this.isLanguageDialogOpen = false;
    this.logger.info('Language selected', { language: language.name, code: language.code }); // Depuración
  }

  openCurrencyDialog(): void {
    this.isCurrencyDialogOpen = true;

  }

  closeCurrencyDialog(): void {
    this.isCurrencyDialogOpen = false;

  }

  selectCurrency(currency: Currency): void {
    this.selectedCurrency = currency;
    this.isCurrencyDialogOpen = false;
    this.logger.info('Currency selected', { currency: currency.code, name: currency.name }); // Depuración
  }
}