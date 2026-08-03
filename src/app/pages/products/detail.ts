import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css'
})
export class ProductDetailComponent implements OnInit {
  private apiService = inject(ApiService);
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
          this.quoteSuccess.set('Your quote request has been submitted successfully! We will contact you with bulk rates.');
          this.resetQuoteForm();
          setTimeout(() => this.closeQuoteModal(), 3000);
        } else {
          this.quoteError.set(res.message || 'Failed to submit quote request.');
        }
      },
      error: (err) => {
        this.submittingQuote.set(false);
        this.quoteError.set(err.error?.message || 'Server connection error. Please try again.');
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
