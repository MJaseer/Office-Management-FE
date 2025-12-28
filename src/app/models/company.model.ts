export interface Company {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDropdown {
  _id: string;
  name: string;
}