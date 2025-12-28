import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CompanyService } from '../../services/company.service';
import { EmployeeService } from '../../services/employee.service';
import { WebsocketService } from '../../services/websocket.service';
import { Employee, EmployeeRole } from '../../models/employee.model';

export type RoleCounts = Record<EmployeeRole, number>;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private companyService = inject(CompanyService);
  private employeeService = inject(EmployeeService);
  private websocketService = inject(WebsocketService);

  companyCount = 0;
  employeeCount = 0;
  roleCounts: RoleCounts = {
    [EmployeeRole.MANAGER]: 0,
    [EmployeeRole.ADMIN]: 0,
    [EmployeeRole.DEVELOPER]: 0,
  };

  isConnected = false;
  recentEmployees: Employee[] = [];
  loading = true;

  ngOnInit() {
    this.loadData();
    this.checkConnection();

    // Listen for WebSocket connection changes
    this.websocketService.listen('connect').subscribe(() => {
      this.isConnected = true;
    });

    this.websocketService.listen('disconnect').subscribe(() => {
      this.isConnected = false;
    });
  }

  loadData() {
    this.loading = true;

    this.companyService.getCompanies().subscribe(companies => {
      this.companyCount = companies.length;
    });

    this.employeeService.getEmployees().subscribe(employees => {
      this.employeeCount = employees.length;

      // Calculate role counts
      this.roleCounts = employees.reduce<RoleCounts>((acc, emp) => {
        acc[emp.role] = (acc[emp.role] || 0) + 1;
        return acc;
      }, { ...this.roleCounts });

      // Get recent employees (last 5)
      this.recentEmployees = [...employees]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      this.loading = false;
    });
  }

  checkConnection() {
    this.isConnected = this.websocketService.isConnected();
  }

  testConnection() {
    this.websocketService.ping();

    // Listen for pong response
    this.websocketService.listen('pong').subscribe((data) => {
      console.log('Pong received:', data);
    });
  }

  refreshData() {
    this.loadData();
    this.companyService.loadCompanies();
    this.employeeService.loadEmployees();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}