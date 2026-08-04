import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  categories = signal<any[]>([]);
  company = signal<any>(null);

  readonly sanitizedMapUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.company()?.googleMapEmbedUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  formData = {
    name: '',
    company: '',
    country: '',
    email: '',
    phone: '',
    productInterest: '',
    message: ''
  };

  submitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  ngOnInit() {
    this.loadCategories();
    this.loadCompanyDetails();
    this.initUserData();
  }

  initUserData() {
    const u = this.authService.currentUser();
    if (u) {
      this.formData.name = u.username || '';
      this.formData.email = u.email || '';
      this.formData.company = u.company || '';
      this.formData.phone = u.phone || '';
      this.formData.country = u.country || '';
    }
  }

  loadCompanyDetails() {
    this.apiService.getCompanyDetails().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.company.set(res.data);
        }
      }
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.categories.set(res.data);
        }
      }
    });
  }

  onSubmit() {
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please Sign In or Create an Account before submitting an export inquiry.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0B3D91',
        confirmButtonText: 'Sign In / Sign Up',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    this.submitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.apiService.submitInquiry(this.formData).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.status === 'success') {
          const msg = 'Thank you! Your inquiry has been submitted successfully. We will get back to you shortly.';
          this.successMessage.set(msg);
          Swal.fire({
            icon: 'success',
            title: 'Inquiry Submitted!',
            text: msg,
            confirmButtonColor: '#0B3D91'
          });
          this.resetForm();
        } else {
          const errMsg = res.message || 'Failed to submit inquiry.';
          this.errorMessage.set(errMsg);
          Swal.fire({
            icon: 'error',
            title: 'Submission Error',
            text: errMsg,
            confirmButtonColor: '#0B3D91'
          });
        }
      },
      error: (err) => {
        this.submitting.set(false);
        const errMsg = err.error?.message || 'A network error occurred. Please try again later.';
        this.errorMessage.set(errMsg);
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: errMsg,
          confirmButtonColor: '#0B3D91'
        });
      }
    });
  }

  private resetForm() {
    this.formData = {
      name: '',
      company: '',
      country: '',
      email: '',
      phone: '',
      productInterest: '',
      message: ''
    };
  }
}
