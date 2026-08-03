import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  private apiService = inject(ApiService);

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

  onSubmit() {
    this.submitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.apiService.submitInquiry(this.formData).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.status === 'success') {
          this.successMessage.set('Thank you! Your inquiry has been submitted successfully. We will get back to you shortly.');
          this.resetForm();
        } else {
          this.errorMessage.set(res.message || 'Failed to submit inquiry.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || 'A network error occurred. Please try again later.');
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
