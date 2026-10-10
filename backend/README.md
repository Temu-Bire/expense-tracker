# Expense Tracker Backend API ⚡

Production-ready RESTful API backend for the **Expense Tracker** application built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## 🏗️ Architecture & Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **ORM & Migrations**: Prisma ORM
- **Request Validation**: Zod (strongly typed schema validation)
- **Security & Logging**: Helmet, CORS, Morgan

---

## 📁 Directory Structure

```
backend/
├── prisma/
│   ├── migrations/
│   │   ├── 20261010000000_init/
│   │   │   └── migration.sql      # Initial PostgreSQL migration DDL
│   │   └── migration_lock.toml    # Prisma migration lock
│   ├── schema.prisma              # Database models (User, Transaction, Category, Budget)
│   └── seed.ts                    # Idempotent default categories seed script
├── scripts/
│   └── test-health.ts             # Health check & error response verification script
├── src/
│   ├── config/                    # Environment and Prisma client singleton
│   ├── controllers/               # Business logic controllers
│   ├── errors/                    # Standardized AppError hierarchy
│   ├── middleware/                # Validation, error handling, 404 middlewares
│   ├── routes/                    # Express route declarations
│   ├── utils/                     # ApiResponse success & error envelopes
│   ├── validators/                # Zod schemas for all domain entities
│   ├── app.ts                     # Express app configuration
│   └── index.ts                   # Server entrypoint with graceful shutdown
├── .env.example                   # Environment configuration template
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | number | `5000` | Port for the HTTP server |
| `NODE_ENV` | string | `development` | Runtime environment (`development`, `production`, `test`) |
| `API_PREFIX` | string | `/api` | Base path prefix for all API endpoints |
| `CORS_ORIGIN` | string | `*` | Allowed CORS origins (comma-separated or `*`) |
| `DATABASE_URL` | string | `postgresql://...` | PostgreSQL connection string |
| `JWT_SECRET` | string | `...` | Secret key for JWT authentication tokens |
| `JWT_EXPIRES_IN` | string | `7d` | Token validity duration |

---

## 🗄️ Database Models (Prisma)

### 1. `User`
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `passwordHash`: String
- `firstName`, `lastName`: String (Optional)
- `currency`: String (Default: `"USD"`)
- `createdAt`, `updatedAt`: DateTime

### 2. `Category`
- `id`: UUID (Primary Key)
- `slug`: String? (Unique, URL-safe slug e.g. `food`, `housing`, `salary`)
- `name`: String
- `icon`: String (Ionicons icon identifier)
- `color`: Hex color string (e.g. `#FF5722`)
- `type`: Enum `TransactionType` (`EXPENSE`, `INCOME`)
- `isDefault`: Boolean (System default category flag)
- `userId`: UUID? (Foreign Key to `User`, nullable for system defaults)

### 3. `Transaction`
- `id`: UUID (Primary Key)
- `title`: String
- `amount`: Decimal (12, 2)
- `type`: Enum `TransactionType` (`EXPENSE`, `INCOME`)
- `date`: DateTime
- `notes`: Text?
- `userId`: UUID (Foreign Key to `User`)
- `categoryId`: UUID (Foreign Key to `Category`)

### 4. `Budget`
- `id`: UUID (Primary Key)
- `name`: String?
- `amount`: Decimal (12, 2)
- `period`: Enum `BudgetPeriod` (`WEEKLY`, `MONTHLY`, `YEARLY`, `CUSTOM`)
- `startDate`: DateTime
- `endDate`: DateTime?
- `userId`: UUID (Foreign Key to `User`)
- `categoryId`: UUID? (Foreign Key to `Category`, optional)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Migrations
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply migrations
npm run prisma:migrate

# Seed default categories
npm run prisma:seed
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build & Run Production Server
```bash
npm run build
npm start
```

### 5. Run Health & Validation Tests
```bash
npm run test:health
```

---

## 📡 API Endpoints Reference

All endpoints (except root `/health`) are prefixed with `/api`.

### Standard Response Envelopes

#### Success Envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
  }
}
```

#### Error Envelope:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "amount", "message": "Amount must be a positive number" }
    ],
    "timestamp": "2026-10-10T06:55:00.000Z",
    "path": "/api/transactions"
  }
}
```

---

### 🩺 Health Checks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check (uptime, environment, status) |
| `GET` | `/api/health` | Prefixed health check |

**Sample 200 OK Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "expense-tracker-api",
    "version": "1.0.0",
    "uptime": 42,
    "timestamp": "2026-10-10T06:55:21.218Z",
    "environment": "development",
    "database": { "provider": "postgresql", "connected": true }
  }
}
```

---

### 🏷️ Categories
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Retrieve all categories (system defaults + user categories) |
| `GET` | `/api/categories?type=EXPENSE` | Filter categories by `EXPENSE` or `INCOME` |
| `GET` | `/api/categories/:id` | Get category by UUID or slug |
| `POST` | `/api/categories` | Create custom category |

**Category Payload (POST):**
```json
{
  "name": "Gym & Fitness",
  "icon": "barbell-outline",
  "color": "#E91E63",
  "type": "EXPENSE",
  "slug": "fitness"
}
```

---

### 💳 Transactions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | List transactions (supports pagination, date range, search) |
| `GET` | `/api/transactions/summary` | Get aggregated financial summary (netBalance, totalIncome, totalExpenses, savingsRate) |
| `GET` | `/api/transactions/:id` | Get single transaction |
| `POST` | `/api/transactions` | Create new transaction |
| `PUT` | `/api/transactions/:id` | Update transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction |

**Create Transaction (POST):**
```json
{
  "title": "Grocery Shopping",
  "amount": 84.50,
  "type": "EXPENSE",
  "categoryId": "category-uuid-or-id",
  "date": "2026-10-10T14:30:00.000Z",
  "notes": "Weekly produce and pantry restock"
}
```

**Financial Summary Response (`GET /api/transactions/summary`):**
```json
{
  "success": true,
  "data": {
    "netBalance": 2150.00,
    "totalIncome": 3500.00,
    "totalExpenses": 1350.00,
    "transactionCount": 18,
    "savingsRate": 61
  }
}
```

---

### 🎯 Budgets
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/budgets` | List budgets with category information |
| `GET` | `/api/budgets/:id` | Get budget by ID |
| `POST` | `/api/budgets` | Create new budget |
| `PUT` | `/api/budgets/:id` | Update existing budget |
| `DELETE` | `/api/budgets/:id` | Delete budget |

**Create Budget (POST):**
```json
{
  "name": "Monthly Food Budget",
  "amount": 500.00,
  "period": "MONTHLY",
  "startDate": "2026-10-01T00:00:00.000Z",
  "categoryId": "category-uuid-food"
}
```

---

### 👤 Authentication & Session Management
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (passwords hashed via bcrypt, returns token pair) |
| `POST` | `/api/auth/login` | Public | Authenticate user (returns access token + refresh token) |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token (issues new access token and rotated refresh token) |
| `POST` | `/api/auth/logout` | Public | Revoke refresh token in database |
| `GET` | `/api/auth/me` | Bearer Token | Fetch authenticated user profile |

**Authorization Header:**
```http
Authorization: Bearer <accessToken>
```

**Register Payload (POST `/api/auth/register`):**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "Alex",
  "lastName": "Smith",
  "currency": "USD"
}
```

**Login Payload (POST `/api/auth/login`):**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Refresh Token Payload (POST `/api/auth/refresh`):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Logout Payload (POST `/api/auth/logout`):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🧪 Testing

```bash
# Run Health & API Validation Tests
npm run test:health

# Run Comprehensive Authentication & Security Test Suite
npm run test:auth
```

