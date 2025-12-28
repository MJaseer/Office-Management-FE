import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  private websocketService = inject(WebsocketService);
  currentYear = new Date().getFullYear();
  isConnected = false;

  ngOnInit() {
    // Check initial connection status
    this.isConnected = this.websocketService.isConnected();

    // Listen for connection changes
    this.websocketService.listen('connect').subscribe(() => {
      this.isConnected = true;
    });

    this.websocketService.listen('disconnect').subscribe(() => {
      this.isConnected = false;
    });
  }

  ngOnDestroy() {
    this.websocketService.disconnect();
  }
}
