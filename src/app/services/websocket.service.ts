import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  private connected = false;

  constructor() {
    this.socket = io(`${environment.wsUrl}/office-management`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupConnection();
  }

  private setupConnection(): void {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.connected = false;
    });

    this.socket.on('connected', (data) => {
      console.log('WebSocket connection established:', data);
    });
  }

  // Listen for events
  listen(event: string): Observable<unknown> {
    return new Observable((subscriber) => {
      this.socket.on(event, (data) => {
        subscriber.next(data);
      });
    });
  }

  // Emit events
  emit(event: string, data: {timestamp: string}): void {
    if (this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Specific event listeners
  onCompanyCreated(): Observable<unknown> {
    return this.listen('company_created');
  }

  onCompanyUpdated(): Observable<unknown> {
    return this.listen('company_updated');
  }

  onCompanyDeleted(): Observable<unknown> {
    return this.listen('company_deleted');
  }

  onEmployeeCreated(): Observable<unknown> {
    return this.listen('employee_created');
  }

  onEmployeeUpdated(): Observable<unknown> {
    return this.listen('employee_updated');
  }

  onEmployeeDeleted(): Observable<unknown> {
    return this.listen('employee_deleted');
  }

  // Ping for testing connection
  ping(): void {
    this.emit('ping', { timestamp: new Date().toISOString() });
  }

  // Check connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Disconnect
  disconnect(): void {
    this.socket.disconnect();
  }
}