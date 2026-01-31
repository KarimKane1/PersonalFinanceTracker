# Personal Finance App

A local-first personal finance planning application built with React, TypeScript, and Vite.

## 🔒 Privacy & Data Storage

**All financial data is stored locally in your browser's localStorage.**

- ✅ **100% Private**: Your data never leaves your device
- ✅ **No Backend**: No servers, no databases, no cloud storage
- ✅ **No Tracking**: No analytics, no data collection
- ✅ **Local Only**: Data is stored in your browser and only accessible to you
- ✅ **Multi-Profile Support**: Each user can create their own profile with isolated data

**Important**: If you clear your browser data, your financial information will be deleted. Each device/browser has its own separate data storage.

## Features (V1)

- **Multi-Profile System**: Create and manage multiple user profiles
- **Income Management**: Configure salary (gross-to-net or net-only) and additional income streams
- **Expense Tracking**: Add and manage monthly expenses
- **Account Management**: Track account balances with APY rates
- **Planning**: Allocate available funds across accounts
- **Dashboard**: Visualize finances with charts and projections
- **Real-time Calculations**: Automatic computation of totals, available funds, and surplus/deficit
- **Local Storage**: All data persists locally in your browser

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  ├── App.tsx              # Main application component
  ├── main.tsx             # Application entry point
  ├── types.ts             # TypeScript type definitions
  ├── types/
  │   └── profile.ts       # Profile type definitions
  ├── components/          # Reusable UI components
  │   ├── Sidebar.tsx
  │   ├── SectionCard.tsx
  │   ├── EditableRowTable.tsx
  │   ├── SalaryCardHeader.tsx
  │   ├── AccountCard.tsx
  │   └── ProfileSelection.tsx
  ├── pages/               # Page components
  │   ├── IncomeExpensesPage.tsx
  │   ├── AccountsPage.tsx
  │   ├── PlanningPage.tsx
  │   └── DashboardPage.tsx
  └── utils/               # Utility functions
      ├── format.ts        # Currency formatting
      ├── storage.ts       # Legacy storage (for migration)
      └── profileStorage.ts # Profile-based storage
```

## Data Model

All data is stored in a `FinanceModel` structure per profile:
- `salaryConfig`: Salary calculation mode and values
- `incomeItems`: Additional income streams
- `expenseItems`: Monthly expenses
- `allocationItems`: Monthly allocation targets (legacy)
- `balanceItems`: Account balances with APY and monthly allocations

Data is automatically saved to localStorage with keys:
- `pf_profiles_v1`: List of all profiles
- `pf_current_profile_v1`: Currently selected profile
- `pf_model_v1_${profileId}`: Financial data for each profile

## Deployment

This app can be deployed to any static hosting service:

1. Build the app: `npm run build`
2. Deploy the `dist` folder to:
   - GitHub Pages
   - Netlify
   - Vercel
   - Any static hosting service

Each user who visits the deployed link will have their own isolated data stored in their browser.

