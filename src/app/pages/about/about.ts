import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit {
  company = signal<any>(null);
  imagesMap = signal<{ [key: string]: string }>({});
  private apiService = inject(ApiService);

  ngOnInit() {
    this.loadCompanyDetails();
    this.loadImageMaster();
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

  loadImageMaster() {
    this.apiService.getImageMaster().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.map) {
          this.imagesMap.set(res.map);
        }
      }
    });
  }
}

