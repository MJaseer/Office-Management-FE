import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { EmployeeService } from '../../../services/employee.service';
import { CompanyService } from '../../../services/company.service';
import { Employee, EmployeeRole } from '../../../models/employee.model';
import { CompanyDropdown } from '../../../models/company.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    ButtonModule,
    CardModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    DropdownModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent  implements OnInit, OnDestroy {
    private employeeService = inject(EmployeeService);
  private companyService = inject(CompanyService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  companies: CompanyDropdown[] = [];
  roles = Object.values(EmployeeRole);
  selectedCompany: string | null = null;
  selectedRole: string | null = null;
  loading = true;
  error: string | null = null;
  private subscriptions = new Subscription();

  ngOnInit() {
    this.loadEmployees();
    this.loadCompanies();
    
    this.subscriptions.add(
      this.employeeService.employees$.subscribe(employees => {
        this.employees = employees;
        this.applyFilters();
      })
    );
    
    this.subscriptions.add(
      this.employeeService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );
    
    this.subscriptions.add(
      this.employeeService.error$.subscribe(error => {
        this.error = error;
      })
    );
  }

  loadEmployees() {
    this.employeeService.loadEmployees();
  }

  loadCompanies() {
    this.companyService.getCompaniesForDropdown().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error) => {
        console.error('Failed to load companies:', error);
      }
    });
  }

  filterByCompany(companyId: string | null) {
    this.selectedCompany = companyId;
    this.applyFilters();
  }

  filterByRole(role: string | null) {
    this.selectedRole = role;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter(employee => {
      let matches = true;
      
      if (this.selectedCompany) {
        matches = matches && employee.company._id === this.selectedCompany;
      }
      
      if (this.selectedRole) {
        matches = matches && employee.role === this.selectedRole;
      }
      
      return matches;
    });
  }

  clearFilters() {
    this.selectedCompany = null;
    this.selectedRole = null;
    this.filteredEmployees = this.employees;
  }

  getRoleSeverity(role: string): string {
    switch (role) {
      case 'Manager': return 'success';
      case 'Admin': return 'warn';
      case 'Developer': return 'info';
      default: return 'secondary';
    }
  }

  confirmDelete(employee: Employee) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteEmployee(employee._id)
    });
  }

  deleteEmployee(id: string) {
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee deleted successfully',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete employee',
          life: 3000
        });
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
