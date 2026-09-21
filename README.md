# ClarityFinance - Personal Finance & Expense Tracker

A full-stack, portfolio-grade **Personal Finance Management Application** built with **React 18 (TypeScript)**, **Tailwind CSS**, **Recharts**, **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2**, and **SQLite**.

Inspired by modern fintech dashboards (e.g. Revolut, Wise, Monzo), this project features dynamic financial metrics, interactive spending charts, rule-based Smart Insights, category budgeting with warning indicators, multi-field transaction search/filtering, and dark mode support.

---

## 🌟 Key Features & Highlights

- 📊 **Dynamic Dashboard**: Interactive Recharts area/bar graphs, 4 KPI summary cards (Total Balance, Income, Expenses, Net Savings), month-over-month percentage changes, recent activity table, and active budget meters.
- 💡 **Smart Insights Engine**: Dynamic rule-based algorithm analyzing spending velocity, top categories, and savings rates from database records.
- 💸 **Transaction Management**: Income/Expense toggle, search by description, filters by type/category/date, multi-column sorting (newest, highest, lowest), pagination, and deletion confirmation modal.
- 🎯 **Category Budgeting**: Set monthly category spending limits with progress indicators and automatic warning badges (70%, 85%, 100%+ exceeded).
- 📈 **Financial Analytics Suite**: Time horizon selector, average daily/monthly spending metrics, top spending category rankings, expense trends, and category distribution donut chart.
- 🏷️ **Category Management**: View category spending sums, item counts, and create custom category icons.
- ⚙️ **Settings & Customization**: Profile management, currency symbol toggle (`₹`, `$`, `€`, `£`), date formatting, appearance mode switch (Light / Dark / System), JSON data export, and clear data controls.
- 🔐 **JWT Authentication**: OAuth2 Bearer token authentication with password hashing and session persistence.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & Lucide React Icon library
- **Visualization**: Recharts (Interactive Line, Bar, Donut, Area charts)
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)

### Backend
- **Framework**: Python 3.14 & FastAPI
- **Database & ORM**: SQLite & SQLAlchemy ORM (configured for seamless PostgreSQL replacement)
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Security**: PyJWT (JSON Web Tokens) & PBKDF2 SHA-256 password hashing

---

## 📁 Directory Structure

```text
calm-mendel/
├── backend/
│   ├── app/
│   │   ├── config.py           # BaseSettings & JWT configuration
│   │   ├── database/           # SQLAlchemy Session & Engine setup
│   │   ├── models/             # User, Category, Transaction, Budget SQLAlchemy models
│   │   ├── schemas/            # Pydantic v2 schemas for API requests & responses
│   │   ├── routes/             # Auth, Transactions, Budgets, Categories, Analytics, Settings APIs
│   │   ├── services/           # Dynamic Smart Insights rules engine
│   │   ├── utils/              # Security (JWT & PBKDF2 hashing) & OAuth2 dependencies
│   │   └── main.py             # FastAPI entrypoint with CORS middleware
│   ├── seed.py                 # Multi-month demo database seeder
│   └── requirements.txt        # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout (Sidebar, Topbar, MobileNav) & Modals
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── pages/              # Dashboard, Transactions, AddTransaction, Budgets, Analytics, Categories, Settings, Auth
│   │   ├── services/           # API client HTTP wrapper
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Main routing component
│   │   ├── main.tsx            # React DOM root entrypoint
│   │   └── index.css           # Tailwind CSS directives
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

Navigate to the `backend/` directory and run the FastAPI server:

```bash
# 1. Open terminal in project root
cd backend

# 2. Run the seed script to populate demo user & 50+ transactions
python seed.py

# 3. Start the FastAPI server using Uvicorn
python -m uvicorn app.main:app --reload --port 8000
```
- **API Swagger Docs**: Visit `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup & Run

In a second terminal window, navigate to `frontend/`:

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite development server
npm run dev
```
- **Web App UI**: Open `http://localhost:3000` in your browser.

---

## 🔑 Demo Login Credentials

For quick testing, click **"Auto Fill"** on the Login screen:
- **Email**: `demo@finance.com`
- **Password**: `password123`

---

## 🔌 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login-json` | Authenticate user & return JWT token |
| `POST` | `/api/auth/register` | Register new user account |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile |
| `GET` | `/api/transactions` | Query transactions with search, filter, sort, and pagination |
| `POST` | `/api/transactions` | Record a new income or expense transaction |
| `PUT` | `/api/transactions/{id}` | Edit an existing transaction |
| `DELETE` | `/api/transactions/{id}` | Delete transaction record |
| `GET` | `/api/budgets` | Fetch active category budgets and spending progress |
| `POST` | `/api/budgets` | Set a category monthly spending limit |
| `GET` | `/api/categories` | List categories with spending sums & item counts |
| `GET` | `/api/analytics/summary` | Generate dashboard KPI cards, charts data, and Smart Insights |
| `GET` | `/api/settings/export` | Export user transactions & settings to JSON |
