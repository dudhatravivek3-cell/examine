import { Component, signal, computed, inject, ChangeDetectionStrategy, NgZone, OnInit, DestroyRef, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  isMenuOpen = signal(false);
  isScrolled = signal(false);
  isLangOpen = signal(false);
  isMobileLangOpen = signal(false);
  company = signal<any>(null);
  
  public readonly translationService = inject(TranslationService);
  public readonly authService = inject(AuthService);
  private apiService = inject(ApiService);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);

  readonly currentLanguageObj = computed<Language>(() => {
    const code = this.translationService.currentLang();
    const langs = this.translationService.languages;
    return langs.find(l => l.code === code) || langs[0] || { code: 'en', name: 'English', badge: 'EN' };
  });

  ngOnInit() {
    this.apiService.getCompanyDetails().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.company.set(res.data);
        }
      }
    });
    if (typeof window !== 'undefined') {
      this.ngZone.runOutsideAngular(() => {
        const handleScroll = () => {
          const scrolled = window.scrollY > 50;
          if (this.isScrolled() !== scrolled) {
            this.ngZone.run(() => {
              this.isScrolled.set(scrolled);
            });
          }
        };

        const handleClick = (e: MouseEvent) => {
          if (this.isLangOpen()) {
            this.ngZone.run(() => {
              this.isLangOpen.set(false);
            });
          }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('click', handleClick);

        this.destroyRef.onDestroy(() => {
          window.removeEventListener('scroll', handleScroll);
          document.removeEventListener('click', handleClick);
        });
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isMenuOpen()) return;

    if (event.key === 'Escape') {
      this.closeMenu();
      const toggleBtn = this.el.nativeElement.querySelector('.mobile-toggle') as HTMLElement;
      toggleBtn?.focus();
      return;
    }

    if (event.key === 'Tab') {
      const navMobile = this.el.nativeElement.querySelector('.nav-mobile');
      if (!navMobile) return;
      
      const focusables = Array.from(
        navMobile.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]')
      ) as HTMLElement[];

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  toggleLangMenu(event: Event) {
    event.stopPropagation();
    this.isLangOpen.update(v => !v);
  }

  toggleMobileLangMenu(event: Event) {
    event.stopPropagation();
    this.isMobileLangOpen.update(v => !v);
  }

  selectLanguage(langCode: string, event: Event) {
    event.stopPropagation();
    this.translationService.changeLanguage(langCode);
    this.isLangOpen.set(false);
  }
}

