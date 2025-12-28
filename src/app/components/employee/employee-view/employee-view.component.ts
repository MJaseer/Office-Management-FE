import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employee-view.component.html',
  styleUrl: './employee-view.component.scss'
})
export class EmployeeViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  private subscriptions = new Subscription();
  employee: Employee | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadEmployee(id);
      }
    });
  }

  loadEmployee(id: string) {
    this.loading = true;
    this.error = null;

    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load employee';
        this.loading = false;
      }
    });
  }

  confirmDelete() {
    if (!this.employee) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.employee.firstName} ${this.employee.lastName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteEmployee()
    });
  }

  deleteEmployee() {
    if (!this.employee) return;

    this.employeeService.deleteEmployee(this.employee._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee deleted successfully',
          life: 3000
        });
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete employee',
          life: 3000
        });
      }
    });
  }

  getRoleSeverity(role: string): string {
    switch (role) {
      case 'Manager': return 'success';
      case 'Admin': return 'warn';
      case 'Developer': return 'info';
      default: return 'secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}