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
import { CompanyService } from '../../../services/company.service';
import { Company } from '../../../models/company.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-list',
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
    TagModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})
export class CompanyListComponent implements OnInit, OnDestroy {
  private companyService = inject(CompanyService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  private subscriptions = new Subscription();
  companies: Company[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadCompanies();

    // Subscribe to company updates
    this.subscriptions.add(
      this.companyService.companies$.subscribe(companies => {
        this.companies = companies;
      })
    );

    this.subscriptions.add(
      this.companyService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );

    this.subscriptions.add(
      this.companyService.error$.subscribe(error => {
        this.error = error;
      })
    );
  }

  loadCompanies() {
    this.companyService.loadCompanies();
  }

  confirmDelete(company: Company) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${company.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteCompany(company._id)
    });
  }

  deleteCompany(id: string) {
    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Company deleted successfully',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete company',
          life: 3000
        });
      }
    });
  }

  exportToCSV() {
    const csvContent = this.convertToCSV(this.companies);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(data: Company[]): string {
    const headers = ['Name', 'Address', 'Email', 'Phone', 'Created At'];
    const rows = data.map(item => [
      `"${item.name}"`,
      `"${item.address || ''}"`,
      `"${item.email || ''}"`,
      `"${item.phone || ''}"`,
      `"${new Date(item.createdAt).toLocaleDateString()}"`
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}