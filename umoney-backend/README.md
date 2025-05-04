# UMoney Backend

## API Structure

The UMoney backend API follows a RESTful structure with the following pattern:

```
/api/users/{userId}/ledgers/{ledgerType}/transactions
```

Where:
- `{userId}` is the ID of the user (use 'current' to refer to the currently authenticated user)
- `{ledgerType}` is one of: 'Income', 'Needs', 'Wants', 'Savings'

## Ledger Types

The system uses four main ledger types:

1. **Income**: Tracks all income transactions
2. **Needs**: Tracks essential expenses (rent, utilities, groceries, etc.)
3. **Wants**: Tracks discretionary expenses (entertainment, dining out, etc.)
4. **Savings**: Tracks savings and investments

## API Endpoints

### Ledgers

- `GET /api/users/:userId/ledgers` - Get all ledgers for a user
- `GET /api/users/:userId/ledgers/:ledgerType` - Get a specific ledger
- `GET /api/users/:userId/ledgers/summary` - Get summary of all ledgers

### Transactions

- `GET /api/users/:userId/ledgers/:ledgerType/transactions` - Get transactions for a specific ledger
- `POST /api/users/:userId/ledgers/income/transactions` - Add an income transaction and distribute it
- `POST /api/users/:userId/ledgers/:ledgerType/transactions` - Add a transaction to a specific ledger
- `PUT /api/users/:userId/ledgers/:ledgerType/transactions/:transactionId` - Update a transaction
- `DELETE /api/users/:userId/ledgers/:ledgerType/transactions/:transactionId` - Delete a transaction

## Income Distribution

When an income transaction is added, it is automatically distributed across the Needs, Wants, and Savings ledgers according to the user's budget preferences (default: 50% Needs, 30% Wants, 20% Savings).

## Data Migration

To migrate data from the old transaction structure to the new ledger structure, run:

```bash
npm run migrate-to-ledgers
```

This script will:
1. Create ledgers for each user
2. Migrate all transactions to the appropriate ledgers
3. Preserve income distribution relationships
4. Update ledger balances

## Authentication

All API endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Uploads

For endpoints that accept file uploads (attachments), use multipart/form-data instead of JSON.
