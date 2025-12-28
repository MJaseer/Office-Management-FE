import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee.model';
import { environment } from '../../environments/environment';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private websocketService = inject(WebsocketService);

  private apiUrl = `${environment.apiUrl}/employees`;
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  employees$ = this.employeesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor() {
    this.loadEmployees();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners(): void {
    // Listen for employee events and refresh data
    this.websocketService.onEmployeeCreated().subscribe(() => {
      this.loadEmployees();
    });

    this.websocketService.onEmployeeUpdated().subscribe(() => {
      this.loadEmployees();
    });

    this.websocketService.onEmployeeDeleted().subscribe(() => {
      this.loadEmployees();
    });

    // listen for storage events
    window.addEventListener('storage', (event) => {
      if (event.key === 'office_employee_update') {
        this.loadEmployees();
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
    }

    this.errorSubject.next(errorMessage);
    console.error('Employee Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  loadEmployees(companyId?: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let url = this.apiUrl;
    if (companyId) {
      url = `${this.apiUrl}?company=${companyId}`;
    }

    this.http.get<Employee[]>(url).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (employees) => {
        this.employeesSubject.next(employees);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
      }
    });
  }

  getEmployees(companyId?: string): Observable<Employee[]> {
    let url = this.apiUrl;
    if (companyId) {
      url = `${this.apiUrl}?company=${companyId}`;
    }
    return this.http.get<Employee[]>(url);
  }

  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createEmployee(employee: CreateEmployeeDto): Observable<Employee> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<Employee>(this.apiUrl, employee).pipe(
      tap(() => {
        localStorage.setItem('office_employee_update', Date.now().toString());
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateEmployee(id: string, employee: UpdateEmployeeDto): Observable<Employee> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee).pipe(
      tap(() => {
        localStorage.setItem('office_employee_update', Date.now().toString());
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteEmployee(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        localStorage.setItem('office_employee_update', Date.now().toString());
      }),
      catchError(this.handleError.bind(this))
    );
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  getCurrentEmployees(): Employee[] {
    return this.employeesSubject.value;
  }
}