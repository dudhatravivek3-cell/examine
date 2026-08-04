import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class AdminLoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeMode = signal<'login' | 'register'>('login');

  // Login fields
  username = '';
  password = '';

  // Register fields
  regUsername = '';
  regEmail = '';
  regPassword = '';
  regCompany = '';
  regPhone = '';
  regCountry = '';

  submitting = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.activeMode.set('register');
      }
    });
  }

  setMode(mode: 'login' | 'register') {
    this.activeMode.set(mode);
    this.errorMessage.set('');
  }

  onSubmitLogin() {
    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.submitting.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'Logged in successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        if (res.data?.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        const errMsg = err.error?.message || 'Invalid username or password.';
        this.errorMessage.set(errMsg);
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: errMsg,
          confirmButtonColor: '#0B3D91'
        });
      }
    });
  }

  onSubmitRegister() {
    this.submitting.set(true);
    this.errorMessage.set('');

    const regData = {
      username: this.regUsername,
      email: this.regEmail,
      password: this.regPassword,
      company: this.regCompany,
      phone: this.regPhone,
      country: this.regCountry
    };

    this.authService.register(regData).subscribe({
      next: (res) => {
        this.submitting.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Your account has been registered successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.submitting.set(false);
        const errMsg = err.error?.message || 'Failed to create account.';
        this.errorMessage.set(errMsg);
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: errMsg,
          confirmButtonColor: '#0B3D91'
        });
      }
    });
  }
}
