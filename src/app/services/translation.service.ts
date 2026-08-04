import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Language {
  code: string;
  name: string;
  badge: string;
}

export const DEFAULT_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', badge: 'EN' },
  { code: 'es', name: 'Español', badge: 'ES' },
  { code: 'fr', name: 'Français', badge: 'FR' },
  { code: 'de', name: 'Deutsch', badge: 'DE' },
  { code: 'zh-CN', name: '中文', badge: 'ZH' },
  { code: 'hi', name: 'हिन्दी', badge: 'HI' },
  { code: 'ar', name: 'العربية', badge: 'AR' },
  { code: 'pt', name: 'Português', badge: 'PT' },
  { code: 'ru', name: 'Русский', badge: 'RU' },
  { code: 'ja', name: '日本語', badge: 'JP' }
];

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiService = inject(ApiService);

  readonly languagesSignal = signal<Language[]>(DEFAULT_LANGUAGES);
  readonly currentLang = signal<string>('en');

  get languages(): Language[] {
    return this.languagesSignal();
  }

  constructor() {
    this.loadCompanyLanguages();
    this.initSavedLanguage();
    this.syncWithWidget();
  }

  loadCompanyLanguages() {
    this.apiService.getCompanyDetails().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data?.supportedLanguages?.length > 0) {
          this.languagesSignal.set(res.data.supportedLanguages);
        }
      }
    });
  }

  private initSavedLanguage() {
    const match = document.cookie.match(/(?:^|; )googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = decodeURIComponent(match[1]).split('/');
      const lang = parts[parts.length - 1];
      if (lang && this.languagesSignal().some(l => l.code === lang)) {
        this.currentLang.set(lang);
        return;
      }
    }
    this.currentLang.set('en');
  }

  private syncWithWidget() {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElem) {
        if (selectElem.value && this.languages.some(l => l.code === selectElem.value)) {
          this.currentLang.set(selectElem.value);
        }
        clearInterval(interval);
      } else if (attempts > 20) {
        clearInterval(interval);
      }
    }, 200);
  }

  changeLanguage(langCode: string) {
    this.currentLang.set(langCode);
    
    // Set Google Translate cookie
    const domain = window.location.hostname;
    const cookieVal = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
    
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (domain && domain !== 'localhost') {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${domain};`;
    }

    const applyToWidget = (): boolean => {
      const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElem) {
        selectElem.value = langCode;
        selectElem.dispatchEvent(new Event('change', { bubbles: true }));
        selectElem.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    };

    if (!applyToWidget()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (applyToWidget() || attempts > 15) {
          clearInterval(interval);
          if (attempts > 15) {
            window.location.reload();
          }
        }
      }, 150);
    }
  }
}
