import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-company-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.scss'
})
export class CompanyCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  companyForm: FormGroup;
  isEditMode = false;
  companyId: string | null = null;
  loading = false;

  constructor() {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      phone: [''],
      email: ['', Validators.email]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.companyId = params['id'];
        this.loadCompany();
      }
    });
  }

  loadCompany() {
    if (this.companyId) {
      this.loading = true;
      this.companyService.getCompany(this.companyId).subscribe({
        next: (company) => {
          this.companyForm.patchValue(company);
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load company',
            life: 3000
          });
          this.loading = false;
          this.router.navigate(['/companies']);
        }
      });
    }
  }

  onSubmit() {
    if (this.companyForm.valid) {
      this.loading = true;
      const companyData = this.companyForm.value;

      if (this.isEditMode && this.companyId) {
        this.companyService.updateCompany(this.companyId, companyData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Company updated successfully',
              life: 3000
            });
            this.router.navigate(['/companies']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update company',
              life: 3000
            });
            this.loading = false;
          }
        });
      } else {
        this.companyService.createCompany(companyData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Company created successfully',
              life: 3000
            });
            this.router.navigate(['/companies']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to create company',
              life: 3000
            });
            this.loading = false;
          }
        });
      }
    }
  }
}
