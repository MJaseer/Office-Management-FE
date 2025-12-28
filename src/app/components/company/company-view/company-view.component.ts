import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CompanyService } from '../../../services/company.service';
import { EmployeeService } from '../../../services/employee.service';
import { Company } from '../../../models/company.model';
import { Employee } from '../../../models/employee.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './company-view.component.html',
  styleUrl: './company-view.component.scss'
})
export class CompanyViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  private subscriptions = new Subscription();
  company: Company | null = null;
  employees: Employee[] = [];
  loading = true;
  employeesLoading = false;
  error: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadCompany(id);
      }
    });
  }

  loadCompany(id: string) {
    this.loading = true;
    this.error = null;

    this.companyService.getCompany(id).subscribe({
      next: (company) => {
        this.company = company;
        this.loadEmployees(id);
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load company';
        this.loading = false;
      }
    });
  }

  loadEmployees(companyId: string) {
    this.employeesLoading = true;
    this.employeeService.getEmployees(companyId).subscribe({
      next: (employees) => {
        this.employees = employees;
        this.employeesLoading = false;
      },
      error: () => {
        this.employees = [];
        this.employeesLoading = false;
      }
    });
  }

  confirmDelete() {
    if (!this.company) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.company.name}? This will also remove all associated employees.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteCompany()
    });
  }

  deleteCompany() {
    if (!this.company) return;

    this.companyService.deleteCompany(this.company._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Company deleted successfully',
          life: 3000
        });
        this.router.navigate(['/companies']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete company',
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadData() {
    if (this.company) {
      this.loadCompany(this.company._id);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
