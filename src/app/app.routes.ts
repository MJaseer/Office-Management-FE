import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'companies',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/company/company-list/company-list.component').then(m => m.CompanyListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./components/company/company-create/company-create.component').then(m => m.CompanyCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/company/company-view/company-view.component').then(m => m.CompanyViewComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/company/company-create/company-create.component').then(m => m.CompanyCreateComponent)
      }
    ]
  },
  {
    path: 'employees',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/employee/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./components/employee/employee-create/employee-create.component').then(m => m.EmployeeCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/employee/employee-view/employee-view.component').then(m => m.EmployeeViewComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/employee/employee-create/employee-create.component').then(m => m.EmployeeCreateComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];