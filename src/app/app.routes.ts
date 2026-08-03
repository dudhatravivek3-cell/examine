import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/catalog').then(m => m.ProductCatalogComponent)
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./pages/products/detail').then(m => m.ProductDetailComponent)
  },
  {
    path: 'infrastructure',
    loadComponent: () => import('./pages/infrastructure/infrastructure').then(m => m.InfrastructureComponent)
  },
  {
    path: 'certifications',
    loadComponent: () => import('./pages/certifications/certifications').then(m => m.CertificationsComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery').then(m => m.GalleryComponent)
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.BlogComponent)
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog/detail').then(m => m.BlogDetailComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin/dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
