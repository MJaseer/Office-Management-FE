import { Company } from './company.model';

export enum EmployeeRole {
  MANAGER = 'Manager',
  ADMIN = 'Admin',
  DEVELOPER = 'Developer'
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: Company;
  role: EmployeeRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: EmployeeRole;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
