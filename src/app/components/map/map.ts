import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  private map!: any;
  private apiService = inject(ApiService);
  private ngZone = inject(NgZone);

  // Standard latitude and longitude mappings for common export destinations
  private countryCoords: { [key: string]: [number, number] } = {
    'US': [37.0902, -95.7129],
    'CA': [56.1304, -106.3468],
    'GB': [55.3781, -3.4360],
    'DE': [51.1657, 10.4515],
    'FR': [46.2276, 2.2137],
    'AE': [23.4241, 53.8478],
    'SA': [23.8859, 45.0792],
    'JP': [36.2048, 138.2529],
    'AU': [-25.2744, 133.7751],
    'IN': [20.5937, 78.9629],
    'SG': [1.3521, 103.8198],
    'ZA': [-30.5595, 22.9375],
    'NL': [52.1326, 5.2913],
    'IT': [41.8719, 12.5674],
    'ES': [40.4637, -3.7492],
    'RU': [61.5240, 105.3188],
    'CN': [35.8617, 104.1954],
    'BR': [-14.2350, -51.9253]
  };

  ngOnInit() {}

  async ngAfterViewInit() {
    // SSR Safe dynamic loading of Leaflet outside Angular zone
    if (typeof window !== 'undefined') {
      try {
        const L = await import('leaflet');
        this.ngZone.runOutsideAngular(() => {
          this.initMap(L);
        });
      } catch (error) {
        console.error('Leaflet initialization failed:', error);
      }
    }
  }

  private initMap(L: any): void {
    // Initialize the Leaflet map centered globally
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [25, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 7,
      scrollWheelZoom: false // disable scroll zooming for better UX on page scrolls
    });

    // CartoDB Positron - Premium light grey map tile
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(this.map);

    this.loadMarkers(L);
  }

  private loadMarkers(L: any): void {
    this.apiService.getCountries().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          res.data.forEach((country: any) => {
            const coords = this.countryCoords[country.code.toUpperCase()];
            if (coords) {
              // Custom HTML marker with animated pulsing ring
              const markerHtml = `
                <div class="marker-pin-wrapper">
                  <div class="marker-pulse"></div>
                  <div class="marker-pin"></div>
                </div>
              `;

              const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: markerHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -36]
              });

              const popupHtml = `
                <div class="map-popup">
                  <h4 class="popup-title">${country.countryName}</h4>
                  <p class="popup-details">${country.exportDetails || 'Active Export Destination'}</p>
                </div>
              `;

              L.marker(coords, { icon: customIcon })
                .addTo(this.map)
                .bindPopup(popupHtml);
            }
          });
        }
      },
      error: (err) => {
        console.error('Failed to load map countries:', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
