# Office Management System - Frontend

A modern Angular application for managing companies and employees with real-time updates across browser tabs.

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/MJaseer/Office-Management-FE.git
cd Office-Management-FE
npm install
```

### 2. Start the Application
```bash
ng serve
```

### 3. Open in Browser
```
http://localhost:4200
```

## Prerequisites

Before starting, ensure:
- **Node.js** (v18+)
- **Angular CLI** (v17+) - `npm install -g @angular/cli`
- **Backend server** running at `http://localhost:3000`
- **MongoDB** instance running

## Project Structure
```
src/app/
├── components/     # Dashboard, Companies, Employees
├── services/       # API & WebSocket services
├── models/         # TypeScript interfaces
├── environments/   # Configuration
└── app.routes.ts   # Routing
```

## Features
- Real-time company & employee management
- Instant updates across browser tabs
- Modern UI with PrimeNG & Tailwind
- Full CRUD operations
- Responsive design

## Troubleshooting

### Common Issues:

**1. CORS Error:**
```
Access blocked by CORS policy
```
**Fix:** Ensure backend is running on `http://localhost:3000` and allows `http://localhost:4200`

**2. WebSocket Connection Failed:**
```
WebSocket connection failed
```
**Fix:** Check if backend WebSocket is enabled and backend is running

**3. API Connection Failed:**
```
Cannot connect to API
```
**Fix:** Run backend server first: `npm run start:dev` in backend directory

## API Configuration

Default environment (no changes needed):
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000'
};
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `ng serve` | Start development server |
| `ng build` | Build for production |
| `ng lint` | Run code linting |

## Support

For issues, check:
1. Console errors in browser (F12)
2. Backend server logs
3. Open an issue in GitHub repository

---

**Happy Managing!**