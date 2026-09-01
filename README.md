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
