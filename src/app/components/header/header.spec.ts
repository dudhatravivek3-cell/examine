import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { HeaderComponent } from './header';

@Component({ template: '' })
class DummyComponent {}

describe('HeaderComponent Accessibility', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'about', component: DummyComponent },
          { path: 'products', component: DummyComponent }
        ]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the header component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should set aria-current="page" on active link', async () => {
    await router.navigate(['/about']);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const aboutLink = compiled.querySelector('a[routerLink="/about"]');
    const homeLink = compiled.querySelector('a[routerLink="/"]');

    expect(aboutLink?.getAttribute('aria-current')).toBe('page');
    expect(homeLink?.getAttribute('aria-current')).toBeNull();
  });
});
