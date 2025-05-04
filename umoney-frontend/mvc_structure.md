# MVC Structure for apiUtils.js

## Directory Structure

```
umoney-frontend/
└── src/
    └── api/
        ├── models/
        │   ├── AuthModel.js
        │   ├── TransactionModel.js
        │   ├── CategoryModel.js
        │   ├── RecipientModel.js
        │   ├── BudgetModel.js
        │   └── ProfileModel.js
        ├── controllers/
        │   ├── AuthController.js
        │   ├── TransactionController.js
        │   ├── CategoryController.js
        │   ├── RecipientController.js
        │   ├── BudgetController.js
        │   └── ProfileController.js
        └── utils/
            └── api.js // Contains handleResponse, getAuthToken, setAuthToken, getHeaders
```

## Component Responsibilities

*   **Models:**
    *   `AuthModel.js`: Handles data related to authentication (user, token).
    *   `TransactionModel.js`: Handles transaction data.
    *   `CategoryModel.js`: Handles category data.
    *   `RecipientModel.js`: Handles recipient data.
    *   `BudgetModel.js`: Handles budget preference data.
    *   `ProfileModel.js`: Handles user profile data.
*   **Controllers:**
    *   `AuthController.js`: Handles authentication logic (login, logout, getCurrentUser, completeSetup).
    *   `TransactionController.js`: Handles transaction-related logic (getTransactions, addIncome, addExpense, getTransactionSummary, getTransactionTags, addTransactionTag, updateTransaction, deleteTransaction).
    *   `CategoryController.js`: Handles category-related logic (getCategories, createCategory).
    *   `RecipientController.js`: Handles recipient-related logic (getRecipients, addRecipient).
    *   `BudgetController.js`: Handles budget preference logic (updateBudgetPreferences).
    *   `ProfileController.js`: Handles user profile logic (updateUserProfile).
*   **Views:**
    *   Since `apiUtils.js` is primarily for API interaction, the "View" component is less relevant here. The components in `src/components` and `src/pages` would act as the "View" and utilize the data fetched and managed by the Models and Controllers.
*   **Utils:**
    *   `api.js`: Contains helper functions like `handleResponse`, `getAuthToken`, `setAuthToken`, and `getHeaders` that are used across different API calls.

## Proposed Changes

1.  Move the existing functions from `apiUtils.js` into the appropriate Model and Controller files.
2.  Update the components in `src/components` and `src/pages` to use the new Model and Controller files.
3.  Create the `api/utils/api.js` file and move the helper functions into it.