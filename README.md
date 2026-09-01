# Expense Tracker Mobile App 💰

A modular, scalable, and cross-platform Expense Tracker mobile application built with **React Native**, **Expo Router (v54)**, **TypeScript**, and **Zustand**.

---

## 📱 Features

- **Dashboard / Transactions Overview**:
  - Real-time Net Balance, Income, and Expense summary cards.
  - Search transactions instantly by title, category, or notes.
  - Filter transactions by type (All, Expenses, Income).
  - Pull-to-refresh and transaction count badges.
- **Analytics & Insights**:
  - Interactive Income vs Expense financial ratio cards.
  - Category breakdown with visual progress bars and percentage distribution.
  - Spending breakdown by category for expenses and income sources.
- **Add / Edit Transaction Modal**:
  - Segmented toggle between Expense and Income.
  - Dynamic category picker with themed icons and colors.
  - Validation with inline and alert feedback.
  - Full editing and deletion support with confirmation dialogs.
- **Local Persistence & Performance**:
  - Fast, offline-first local storage via `@react-native-async-storage/async-storage`.
  - Lightweight reactive state management with **Zustand**.
  - Fully typed domain models and design tokens.
  - Cross-platform support for iOS, Android, and Web.
  - Dark Mode and Light Mode theme compatibility.

---

## 🏗️ Folder Structure

The project follows a clean, modular, industry-standard architecture:

```text
├── app/                                 # Expo Router (File-based Routing Layer)
│   ├── (tabs)/
│   │   ├── _layout.tsx                  # Bottom tab navigator configuration
│   │   ├── analytics.tsx                # Analytics & category breakdown tab
│   │   └── index.tsx                    # Transactions dashboard tab
│   ├── +not-found.tsx                   # 404 Route
│   ├── _layout.tsx                      # Root layout, theme provider, and store init
│   └── add-expense.tsx                  # Add / Edit Transaction modal route
├── assets/                              # App icons, splash screens, and images
├── src/                                 # Core Application Layer
│   ├── components/                      # Reusable UI components
│   │   ├── common/                      # Atomic UI primitives
│   │   │   ├── Button.tsx               # Primary, secondary, danger, outline buttons
│   │   │   ├── Card.tsx                 # Themed card container
│   │   │   ├── EmptyState.tsx           # Empty state with icon and action button
│   │   │   ├── Header.tsx               # Header title & action bar
│   │   │   ├── Input.tsx                # Styled text and numeric inputs
│   │   │   └── SegmentedControl.tsx     # Toggle between Expense and Income
│   │   └── expense/                     # Expense domain-specific components
│   │       ├── CategoryBadge.tsx        # Colored category badge with icon
│   │       ├── CategoryPicker.tsx       # Interactive category selector grid
│   │       ├── SummaryCard.tsx          # Overview card for balance & cash flow
│   │       └── TransactionItem.tsx      # Interactive transaction card with delete & edit
│   ├── constants/                       # Theme tokens & defaults
│   │   ├── categories.ts                # Category metadata (names, icons, colors)
│   │   ├── index.ts
│   │   └── theme.ts                     # Colors, typography, spacing, border radiuses, shadows
│   ├── hooks/                           # Custom React hooks
│   │   ├── index.ts
│   │   ├── useColorScheme.ts            # Safe cross-platform theme hook (web & native)
│   │   └── useExpenseSummary.ts         # Hook calculating totals, balance, and category stats
│   ├── services/                        # Storage & data services
│   │   ├── index.ts
│   │   └── storage.ts                   # Typed AsyncStorage operations with error handling
│   ├── store/                           # State management
│   │   ├── index.ts
│   │   └── useExpenseStore.ts           # Centralized Zustand store with persistence
│   ├── types/                           # TypeScript definitions
│   │   ├── expense.ts                   # Expense, Category, Summary, and Filter definitions
│   │   └── index.ts
│   └── utils/                           # Pure utility functions
│       ├── calculations.ts              # Mathematical sums, balance, category statistics
│       ├── formatters.ts                # Currency ($), date, and percentage formatting
│       └── index.ts
├── tsconfig.json                        # Path aliases (@/* -> ./src/*)
├── package.json
└── app.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npx expo start
```

- Press `i` to open in iOS Simulator (macOS required).
- Press `a` to open in Android Emulator.
- Press `w` to open in Web Browser.

### 3. Type Checking & Linting

```bash
# Type check
npx tsc --noEmit

# Lint check
npm run lint
```
