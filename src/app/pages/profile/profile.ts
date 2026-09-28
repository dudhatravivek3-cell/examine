import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  activeTab = signal<'quotes' | 'inquiries'>('quotes');
  myQuotes = signal<any[]>([]);
  myInquiries = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.apiService.getMyQuotes().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.myQuotes.set(res.data);
        }
      }
    });

    this.apiService.getMyInquiries().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.status === 'success' && res.data) {
          this.myInquiries.set(res.data);
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setTab(tab: 'quotes' | 'inquiries') {
    this.activeTab.set(tab);
  }

  onLogout() {
    this.authService.logout();
  }
}
