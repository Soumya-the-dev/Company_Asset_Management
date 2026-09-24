# Company Asset Management System - Frontend

A professional, enterprise-grade internal dashboard for managing company IT hardware, software licenses, employee custody allocations, maintenance records, and return workflows.

Built with **React**, **JavaScript**, **Vite**, **React Router**, and **Vanilla CSS** with a centralized Fetch API communication layer designed for a **FastAPI** backend.

---

## 🏗️ Architecture & Folder Structure

```
frontend/
├── .env.example
├── .env
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── variables.css      # Design tokens (Enterprise Slate, Cobalt, Statuses)
│   │       ├── layout.css         # Sidebar, Header, Responsive Drawer, Page Shell
│   │       ├── components.css     # Buttons, Modals, Badges, Forms, StatCards, Toasts
│   │       └── tables.css         # Tables, Filters, Pagination, Empty/Loading States
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx        # Navigation sidebar with active page highlight
│   │   │   ├── Header.jsx         # Contextual page header and live API status
│   │   │   └── Layout.jsx         # App shell wrapping sidebar, header, and toast container
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx         # Multi-variant button (primary, secondary, danger, subtle)
│   │   │   ├── Modal.jsx          # Accessible dialog with escape listener and backdrop
│   │   │   ├── ConfirmDialog.jsx  # Confirmation modal for critical actions (e.g. deletion)
│   │   │   ├── SearchBar.jsx      # Debounced search bar with clear button
│   │   │   ├── Loading.jsx        # Accessible loading spinner
│   │   │   ├── ErrorMessage.jsx   # Error banner with retry trigger
│   │   │   ├── EmptyState.jsx     # Friendly zero-data state with action buttons
│   │   │   ├── StatusBadge.jsx    # Status pill with color-coded dot and high contrast
│   │   │   ├── Pagination.jsx     # Enterprise table pagination with range display
│   │   │   └── Toast.jsx          # Floating notification banner
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx       # Metric summary card with clickable filter navigation
│   │   │   └── RecentActivity.jsx # Real-time feed of checkouts, returns, and repairs
│   │   │
│   │   ├── assets/
│   │   │   ├── AssetTable.jsx     # Tabular view with hardware specs, custodian, and actions
│   │   │   ├── AssetForm.jsx      # Create & Edit form with field validation
│   │   │   ├── AssetDetails.jsx   # Specifications, custodian card, and status audit trail
│   │   │   └── AssetFilters.jsx   # Dropdown filters for Status, Type, Category, and chips
│   │   │
│   │   ├── employees/
│   │   │   ├── EmployeeTable.jsx  # Directory table with assigned asset counters
│   │   │   ├── EmployeeForm.jsx   # Staff onboarding & edit form with email validation
│   │   │   └── EmployeeDetails.jsx# Staff profile, active assets, and allocation history
│   │   │
│   │   ├── assignments/
│   │   │   ├── AssignmentTable.jsx# Active checkouts and historical allocation records
│   │   │   ├── AssignmentForm.jsx # Asset assignment modal (available inventory only)
│   │   │   └── ReturnRequest.jsx  # Return queue approval/rejection workflows
│   │   │
│   │   └── services/
│   │       ├── ServiceTable.jsx   # Maintenance and repair tickets
│   │       ├── ServiceForm.jsx    # Diagnostic logging and vendor tracking
│   │       └── ServiceDetails.jsx # Detailed ticket view with resolution trigger
│   │
│   ├── context/
│   │   └── ToastContext.jsx       # Application-wide notification context
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx          # Live metric cards and operational activity feed
│   │   ├── Assets.jsx             # Asset inventory catalog, filters, and CRUD
│   │   ├── Employees.jsx          # Staff directory and custodian tracking
│   │   ├── Assignments.jsx        # Allocation checkouts, history, and return approvals
│   │   ├── Services.jsx           # Hardware repairs, periodic maintenance, and vendors
│   │   └── NotFound.jsx           # 404 handler with return-to-dashboard navigation
│   │
│   ├── services/
│   │   ├── api.js                 # Central Fetch API client with transparent mock fallback
│   │   ├── mockData.js            # In-memory mock store with state-machine transition rules
│   │   ├── assetService.js        # Assets and dashboard stats API calls
│   │   ├── employeeService.js     # Employee directory API calls
│   │   ├── assignmentService.js   # Checkout, return, and approval API calls
│   │   └── serviceRecordService.js# Maintenance tickets API calls
│   │
│   ├── utils/
│   │   ├── constants.js           # Enums, statuses, categories, departments, badge styling
│   │   ├── formatters.js          # Date, currency, text, and initials formatters
│   │   └── validators.js          # Form validation helpers
│   │
│   ├── App.jsx                    # Route definitions and Layout shell
│   ├── main.jsx                   # Entry point with StrictMode
│   └── index.css                  # Global resets, typography, and detail grids
```

---

## ⚙️ Setup and Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `frontend` root:
```env
# URL for the FastAPI backend
VITE_API_BASE_URL=http://localhost:8000/api

# Set to true to force offline mock mode during development or testing
VITE_USE_MOCK=false
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start on **`http://localhost:5173/`**.

### 4. Build for Production
```bash
npm run build
```

---

## 🔄 State Machine & Deterministic Workflow Rules

| Current Status | Permitted Operations | Next Status |
| :--- | :--- | :--- |
| **Available** | Assign to Employee (`POST /assignments`) | **Assigned** |
| | Log Maintenance (`POST /service-records`) | **In Repair** |
| | Decommission / Retire | **Retired** |
| **Assigned** | Return Request (`POST /return-requests`) | **Return Requested** |
| | Direct Return (`POST /assignments/{id}/return`) | **Available** |
| **Return Requested** | Manager Approval (`POST /return-requests/{id}/approve`) | **Available** |
| | Manager Rejection (`POST /return-requests/{id}/reject`) | **Assigned** |
| **In Repair** | Mark Completed (`PUT /service-records/{id}`) | **Available** |
| **Retired** | Archival view only | *Terminal State* |

The frontend strictly enforces these transition rules in the UI (e.g. disabling the assign button if an asset is already checked out or in repair), while delegating final validation to the backend.

---

## 📡 Backend API Endpoints Expected

| Module | Method | Path |
| :--- | :--- | :--- |
| **Dashboard** | `GET` | `/stats` |
| **Assets** | `GET` | `/assets` (`?search=&status=&asset_type=&category=`) |
| | `GET` | `/assets/{id}` |
| | `GET` | `/assets/{id}/history` |
| | `POST` | `/assets` |
| | `PUT` | `/assets/{id}` |
| | `DELETE` | `/assets/{id}` |
| **Employees** | `GET` | `/employees` (`?search=&department=`) |
| | `GET` | `/employees/{id}` |
| | `POST` | `/employees` |
| | `PUT` | `/employees/{id}` |
| | `DELETE` | `/employees/{id}` |
| **Assignments** | `GET` | `/assignments` (`?active_only=true`) |
| | `POST` | `/assignments` |
| | `POST` | `/assignments/{id}/return` |
| | `GET` | `/return-requests` |
| | `POST` | `/return-requests/{id}/approve` |
| | `POST` | `/return-requests/{id}/reject` |
| **Services** | `GET` | `/service-records` (`?status=`) |
| | `POST` | `/service-records` |
| | `PUT` | `/service-records/{id}` |
| | `DELETE` | `/service-records/{id}` |

---

## 🧪 Testing Checklist

- [x] **Dashboard**: Metric summary cards display live counts; cards link directly to filtered asset views; recent activity feed displays checkouts, returns, and maintenance.
- [x] **Assets**: Table displays columns (Tag, Type, Serial, Model, Custodian, Dept, Date, Status); search and multi-criteria filters work; pagination operates cleanly; register and edit modals validate inputs; delete confirmation prevents accidental loss; details view displays specifications and status audit trail.
- [x] **Employees**: Directory lists staff with active asset counters; search by name/email/code; add/edit forms enforce email validation; details modal shows assigned hardware and past checkouts.
- [x] **Assignments**: Shows active checkouts vs history; assignment modal only shows eligible in-stock inventory; direct return process updates asset state; return request queue supports approval and rejection.
- [x] **Services**: Maintenance records track issue diagnostics, costs, and providers; creating a ticket marks asset as "In Repair"; resolving ticket returns asset to "Available".
- [x] **Resilience**: Centralized `api.js` transparently falls back to `mockData.js` if the backend is offline.
- [x] **Accessibility & Code Quality**: Semantic HTML, high-contrast badges, keyboard focus rings, zero ESLint compilation errors (`npm run build` exits 0).
