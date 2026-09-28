import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  company = signal<any>(null);
  categories = signal<any[]>([]);
  private apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getCompanyDetails().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.company.set(res.data);
        }
      }
    });

    this.apiService.getCategories().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.categories.set(res.data);
        }
      }
    });
  }
}

