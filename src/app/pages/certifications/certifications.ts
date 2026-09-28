import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss'
})
export class CertificationsComponent implements OnInit {
  private apiService = inject(ApiService);
  certifications = signal<any[]>([]);

  ngOnInit() {
    this.loadCertifications();
  }

  loadCertifications() {
    this.apiService.getCertifications().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.certifications.set(res.data);
        }
      }
    });
  }
}
