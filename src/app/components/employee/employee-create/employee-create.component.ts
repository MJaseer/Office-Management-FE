import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { EmployeeService } from '../../../services/employee.service';
import { CompanyService } from '../../../services/company.service';
import { CreateEmployeeDto, EmployeeRole, UpdateEmployeeDto } from '../../../models/employee.model';
import { CompanyDropdown } from '../../../models/company.model';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './employee-create.component.html',
  styleUrl: './employee-create.component.scss'
})
export class EmployeeCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  companies: CompanyDropdown[] = [];
  roles = Object.values(EmployeeRole);
  loading = false;

  constructor() {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCompanies();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = params['id'];
        this.loadEmployee();
      }
    });

    // Check for company query parameter
    this.route.queryParams.subscribe(params => {
      if (params['company']) {
        this.employeeForm.patchValue({
          company: params['company']
        });
      }
    });
  }

  loadCompanies() {
    this.companyService.getCompaniesForDropdown().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load companies',
          life: 3000
        });
      }
    });
  }

  loadEmployee() {
    if (this.employeeId) {
      this.loading = true;
      this.employeeService.getEmployee(this.employeeId).subscribe({
        next: (employee) => {
          this.employeeForm.patchValue({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            company: employee.company._id,
            role: employee.role
          });
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load employee',
            life: 3000
          });
          this.loading = false;
          this.router.navigate(['/employees']);
        }
      });
    }
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      this.loading = true;
      const employeeData: CreateEmployeeDto = this.employeeForm.value;

      if (this.isEditMode && this.employeeId) {
        const updateData: UpdateEmployeeDto = employeeData;
        this.employeeService.updateEmployee(this.employeeId, updateData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee updated successfully',
              life: 3000
            });
            this.router.navigate(['/employees']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update employee',
              life: 3000
            });
            this.loading = false;
          }
        });
      } else {
        this.employeeService.createEmployee(employeeData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee created successfully',
              life: 3000
            });
            this.router.navigate(['/employees']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to create employee',
              life: 3000
            });
            this.loading = false;
          }
        });
      }
    }
  }
}