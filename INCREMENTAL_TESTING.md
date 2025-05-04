# Incremental Testing Strategy for UMoney

This guide outlines how to run targeted tests based on the specific changes you've made to the codebase. This approach saves time and provides faster feedback during development.

## Testing Based on Change Type

### 1. Backend Changes

#### Transaction Utility Functions
If you've modified transaction utility functions (e.g., `distributeIncome`, `updateIncomeTransaction`):

```bash
cd umoney-backend
npx jest tests/transactionUtils.test.js
```

For specific function tests:

```bash
# Test only distributeIncome function
npx jest -t "distributeIncome"

# Test only updateIncomeTransaction function
npx jest -t "updateIncomeTransaction"

# Test only deleteIncomeTransaction function
npx jest -t "deleteIncomeTransaction"
```

#### API Routes
If you've modified API routes or controllers:

```bash
cd umoney-backend
npx jest tests/transactionRoutes.test.js
```

For specific route tests:

```bash
# Test only POST /income endpoint
npx jest -t "POST /api/transactions/income"

# Test only PUT endpoint
npx jest -t "PUT /api/transactions/:id"

# Test only DELETE endpoint
npx jest -t "DELETE /api/transactions/:id"
```

#### Models
If you've modified the Transaction model schema:

```bash
cd umoney-backend
npx jest -t "Transaction"
```

### 2. Frontend Changes

#### Component Changes
If you've modified specific components:

```bash
cd umoney-frontend

# Test TransactionPage component
npm test -- -t "TransactionPage"

# Test Dashboard component
npm test -- -t "Dashboard"

# Test TransactionForm component
npm test -- -t "TransactionForm"
```

#### API Utility Changes
If you've modified API utility functions:

```bash
cd umoney-frontend
npm test -- -t "apiUtils"
```

#### Context Changes
If you've modified context providers:

```bash
cd umoney-frontend
npm test -- -t "AuthContext"
```

### 3. Full Integration Tests

After making changes that affect multiple components or the interaction between frontend and backend:

```bash
cd umoney-frontend
npm test -- -t "Integration"
```

## Automated Pre-commit Testing

Consider setting up a pre-commit hook to automatically run relevant tests before committing changes:

1. Install husky and lint-staged:

```bash
npm install --save-dev husky lint-staged
```

2. Add the following to your package.json:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "umoney-backend/**/*.js": [
      "cd umoney-backend && npx jest --findRelatedTests"
    ],
    "umoney-frontend/src/**/*.{js,jsx}": [
      "cd umoney-frontend && npm test -- --findRelatedTests"
    ]
  }
}
```

This will automatically run tests that are related to the files you've changed.

## Testing During Development

During active development, use watch mode to automatically run tests when files change:

```bash
# Backend
cd umoney-backend
npx jest --watch

# Frontend
cd umoney-frontend
npm test
```

## Testing Based on Feature Area

### Transaction Distribution Feature

If you've made changes to the income distribution functionality:

```bash
# Backend tests
cd umoney-backend
npx jest -t "distributeIncome|updateIncomeTransaction"

# Frontend tests
cd umoney-frontend
npm test -- -t "distribution|income"
```

### Transaction UI Feature

If you've made changes to how transactions are displayed:

```bash
cd umoney-frontend
npm test -- -t "TransactionPage|Dashboard"
```

### Form Handling Feature

If you've made changes to transaction forms:

```bash
cd umoney-frontend
npm test -- -t "TransactionForm"
```

## Quick Test Commands Reference

Add these scripts to your package.json for convenience:

### Backend (umoney-backend/package.json)

```json
"scripts": {
  "test:utils": "jest tests/transactionUtils.test.js",
  "test:routes": "jest tests/transactionRoutes.test.js",
  "test:watch:utils": "jest tests/transactionUtils.test.js --watch",
  "test:watch:routes": "jest tests/transactionRoutes.test.js --watch"
}
```

### Frontend (umoney-frontend/package.json)

```json
"scripts": {
  "test:components": "react-scripts test --testPathPattern=src/components",
  "test:integration": "react-scripts test --testPathPattern=src/tests/integration",
  "test:transaction-page": "react-scripts test TransactionPage",
  "test:dashboard": "react-scripts test Dashboard",
  "test:transaction-form": "react-scripts test TransactionForm"
}
```

## Best Practices

1. **Run specific tests first**: When making changes, first run the tests most closely related to your changes.
2. **Run integration tests before committing**: Always run integration tests before committing to ensure your changes don't break other parts of the application.
3. **Add new tests for new features**: When adding new functionality, always add corresponding tests.
4. **Update tests when changing behavior**: If you change how a feature works, update the tests to match the new behavior.
5. **Use watch mode during development**: Keep tests running in watch mode during active development for immediate feedback.
