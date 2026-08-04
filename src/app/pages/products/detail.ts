import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product = signal<any>(null);
  selectedImage = signal<string>('');
  loading = signal(true);

  // Quote Request Form
  showQuoteModal = signal(false);
  quoteData = {
    name: '',
    companyName: '',
    country: '',
    email: '',
    phone: '',
    productName: '',
    quantity: '',
    message: ''
  };
  submittingQuote = signal(false);
  quoteSuccess = signal('');
  quoteError = signal('');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProductDetails(slug);
      }
    });
  }

  loadProductDetails(slug: string) {
    this.loading.set(true);
    this.apiService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.status === 'success' && res.data) {
          this.product.set(res.data);
          this.selectedImage.set(res.data.images[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80');
          this.quoteData.productName = res.data.name; // pre-fill forms product field
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Failed to load product details:', err);
      }
    });
  }

  selectImage(img: string) {
    this.selectedImage.set(img);
  }

  openQuoteModal() {
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please Sign In or Create an Account before requesting a quote.',
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

    const u = this.authService.currentUser();
    if (u) {
      this.quoteData.name = u.username || '';
      this.quoteData.email = u.email || '';
      this.quoteData.companyName = u.company || '';
      this.quoteData.phone = u.phone || '';
      this.quoteData.country = u.country || '';
    }

    this.showQuoteModal.set(true);
    this.quoteSuccess.set('');
    this.quoteError.set('');
  }

  closeQuoteModal() {
    this.showQuoteModal.set(false);
  }

  onSubmitQuote() {
    this.submittingQuote.set(true);
    this.quoteSuccess.set('');
    this.quoteError.set('');

    this.apiService.submitQuote(this.quoteData).subscribe({
      next: (res) => {
        this.submittingQuote.set(false);
        if (res.status === 'success') {
          const msg = 'Your quote request has been submitted successfully! We will contact you with bulk rates.';
          this.quoteSuccess.set(msg);
          Swal.fire({
            icon: 'success',
            title: 'Quote Request Sent!',
            text: msg,
            confirmButtonColor: '#0B3D91'
          });
          this.resetQuoteForm();
          this.closeQuoteModal();
        } else {
          const errMsg = res.message || 'Failed to submit quote request.';
          this.quoteError.set(errMsg);
          Swal.fire({
            icon: 'error',
            title: 'Request Failed',
            text: errMsg,
            confirmButtonColor: '#0B3D91'
          });
        }
      },
      error: (err) => {
        this.submittingQuote.set(false);
        const errMsg = err.error?.message || 'Server connection error. Please try again.';
        this.quoteError.set(errMsg);
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: errMsg,
          confirmButtonColor: '#0B3D91'
        });
      }
    });
  }

  private resetQuoteForm() {
    this.quoteData = {
      name: '',
      companyName: '',
      country: '',
      email: '',
      phone: '',
      productName: this.product()?.name || '',
      quantity: '',
      message: ''
    };
  }
}
