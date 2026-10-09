# Expense Tracker Mobile App 💰

A modular, scalable, and cross-platform Expense Tracker mobile application built with **React Native**, **Expo Router**, **TypeScript**, and **Zustand**.

---

## 📱 Features

- **Dashboard / Transactions Overview**:
  - **Date Grouping**: Transactions organized by calendar day (*Today*, *Yesterday*, formatted dates) with daily subtotal badges.
  - **Executive Summary Card**: Real-time Net Balance, Total Income, Total Outflow, and Surplus/Deficit trend indicators.
  - **Privacy Mode**: One-tap eye toggle to mask sensitive balances (`••••••`).
  - **Time Period Filter**: Seamlessly switch between *All Time*, *This Month*, and *Past 7 Days*.
  - **Unified Type Filter**: Filter effortlessly by *All*, *Expenses*, or *Income*.
  - **Smart Search**: Search transactions by title, category name, amount, or notes.
  - **Pull-to-Refresh & Haptics**: Native tactile feedback on tabs, buttons, and pull-to-refresh.
- **Analytics & Insights**:
  - Interactive Income vs Expense financial ratio cards with budget progress bars.
  - High-level insight highlights: **Top Category** (% of spend) and **Average Entry**.
  - Dynamic category breakdowns with color-coded progress bars and percentage distribution.
  - Time period filtering (*All Time*, *This Month*, *Past 7 Days*).
- **Add / Edit Transaction Modal**:
  - Quick Date Selector (*Today*, *Yesterday*, *Other Date* with custom date support).
  - Segmented toggle between Expense and Income.
  - Categorized picker with themed badges and icons.
  - Input sanitation and inline error validation.
  - Full editing and deletion support with haptic confirmation.
- **Local Persistence & Performance**:
  - Offline-first local storage via `@react-native-async-storage/async-storage`.
  - Lightweight reactive state management with **Zustand**.
  - One-tap **Sample Data Loader** for quick testing and onboarding.
  - Reset & clear all data capability.
  - Adaptive Dark Mode and Light Mode theme compatibility.

---

## 🏗️ Project Architecture

```
expense-tracker/
├── app/                        # Expo Router screen routes
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom tab navigation bar with haptics
│   │   ├── index.tsx           # Dashboard / Transactions Overview
│   │   └── analytics.tsx       # Analytics & Spending breakdown
│   ├── _layout.tsx             # Root layout & providers
│   ├── add-expense.tsx         # Add / Edit Transaction modal
│   └── +not-found.tsx          # 404 screen
├── src/                        # Modular source code
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Base UI elements (Button, Card, Input, EmptyState, SegmentedControl, Header)
│   │   ├── expense/            # Domain components (SummaryCard, TransactionItem, CategoryBadge, CategoryPicker)
│   │   └── index.ts            # Root component barrel
│   ├── constants/              # Categories, theme tokens, and demo seed data
│   ├── hooks/                  # Custom hooks (useExpenseSummary, useColorScheme)
│   ├── services/               # Storage service (AsyncStorage abstractions)
│   ├── store/                  # Zustand store (useExpenseStore)
│   ├── types/                  # TypeScript domain models
│   └── utils/                  # Calculations, formatters, and cross-platform haptics
├── assets/                     # App icons and splash screens
├── .env                        # Local packager IP configuration
└── package.json
```

---

## 🚀 Running the App

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
# Standard start (uses Wi-Fi IP configured in .env)
npm run start

# Tunnel mode (recommended if on different Wi-Fi networks or public hotspot)
npm run start:tunnel

# LAN mode
npm run start:lan

# Clear Metro bundler cache
npm run start:clear
```

### 3. Fixing `java.io.IOException: Failed to download remote update` in Expo Go

If Expo Go shows this error when scanning the QR code:
1. **WSL / Virtual Adapter Conflict (Most Common)**:
   Windows with WSL, Hyper-V, or Docker uses a virtual network adapter (e.g. `172.18.x.x`). The phone cannot reach this internal IP.
   - We configured `.env` with `REACT_NATIVE_PACKAGER_HOSTNAME` set to your physical Wi-Fi IP.
   - Alternatively, run `npm run start:tunnel` to connect through a cloud tunnel that bypasses local network restrictions completely!
2. **Same Wi-Fi Network**: Ensure your mobile phone and PC are connected to the exact same Wi-Fi network (or mobile hotspot), or use `npm run start:tunnel`.
3. **Windows Firewall**: If prompted by Windows Defender Firewall, allow `Node.js JavaScript Runtime` access on Private networks.

---

## 🧪 Quality Checks

```bash
# Type check with TypeScript
npx tsc --noEmit

# Lint check with ESLint
npm run lint
```
