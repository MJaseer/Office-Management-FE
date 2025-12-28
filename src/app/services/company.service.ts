import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Company, CompanyDropdown } from '../models/company.model';
import { environment } from '../../environments/environment';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private websocketService = inject(WebsocketService);

  private apiUrl = `${environment.apiUrl}/companies`;
  private companiesSubject = new BehaviorSubject<Company[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  companies$ = this.companiesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor( ) {
    this.loadCompanies();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners(): void {
    // Listen for company events and refresh data
    this.websocketService.onCompanyCreated().subscribe(() => {
      this.loadCompanies();
    });

    this.websocketService.onCompanyUpdated().subscribe(() => {
      this.loadCompanies();
    });

    this.websocketService.onCompanyDeleted().subscribe(() => {
      this.loadCompanies();
    });

    // Also listen for storage events (for same-origin tabs)
    window.addEventListener('storage', (event) => {
      if (event.key === 'office_company_update') {
        this.loadCompanies();
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
    }

    this.errorSubject.next(errorMessage);
    console.error('Company Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  loadCompanies(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<Company[]>(this.apiUrl).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (companies) => {
        this.companiesSubject.next(companies);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
      }
    });
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getCompany(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createCompany(company: Omit<Company, '_id' | 'createdAt' | 'updatedAt'>): Observable<Company> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<Company>(this.apiUrl, company).pipe(
      tap(() => {
        // Notify other tabs via localStorage
        localStorage.setItem('office_company_update', Date.now().toString());
        this.websocketService.ping(); // Test connection
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateCompany(id: string, company: Partial<Company>): Observable<Company> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<Company>(`${this.apiUrl}/${id}`, company).pipe(
      tap(() => {
        localStorage.setItem('office_company_update', Date.now().toString());
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteCompany(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        localStorage.setItem('office_company_update', Date.now().toString());
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getCompaniesForDropdown(): Observable<CompanyDropdown[]> {
    return this.http.get<CompanyDropdown[]>(`${this.apiUrl}/dropdown`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Clear error
  clearError(): void {
    this.errorSubject.next(null);
  }

  // Get current companies value
  getCurrentCompanies(): Company[] {
    return this.companiesSubject.value;
  }
}