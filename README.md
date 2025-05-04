# UMoney Web Application

UMoney is a comprehensive personal finance management application that helps users track their income, expenses, and savings using the 50-30-20 budgeting rule. The application automatically distributes income into Needs (50%), Wants (30%), and Savings (20%) categories, with customizable percentages. This document provides instructions on how to set up and run the application.

## Project Structure

The project consists of two main components:

- **umoney-backend**: Node.js/Express backend API server
- **umoney-frontend**: React.js frontend application

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or MongoDB Atlas account)

## Setting Up the Backend

1. Navigate to the backend directory:

```bash
cd "umoney-backend"
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root of the backend directory with the following variables:

```
# Required environment variables
MONGO_URI=your_mongodb_connection_string        # Required: MongoDB connection string
JWT_SECRET=your_jwt_secret_key                  # Required: Secret key for JWT token generation and verification
SESSION_SECRET=your_session_secret              # Required: Secret key for session management

# Optional environment variables
GOOGLE_CLIENT_ID=your_google_client_id          # Required for Google authentication
GOOGLE_CLIENT_SECRET=your_google_client_secret  # Required for Google authentication
NODE_ENV=development                            # Optional: Defaults to development if not set
PORT=5000                                       # Optional: Defaults to 5000 if not set
```

> **IMPORTANT**: The application will not start if the required environment variables (MONGO_URI, JWT_SECRET, SESSION_SECRET) are not set. These are critical for security and functionality.

4. Start the backend server:

```bash
npm start
```

The backend server will run on http://localhost:5000 by default.

## Setting Up the Frontend

1. Navigate to the frontend directory:

```bash
cd "umoney-frontend"
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm start
```

The frontend application will run on http://localhost:3000 by default.

## Google OAuth Setup

To enable Google authentication:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Set up OAuth credentials
4. Add the following authorized redirect URIs:
   - http://localhost:5000/api/auth/google/callback
5. Copy the Client ID and Client Secret to your backend `.env` file

## Features

UMoney Web provides the following features:

- **User Authentication**: Sign in with Google
- **Transaction Tracking**: Record income and expenses with attachments
- **Automatic Income Distribution**: Distribute income according to the 50-30-20 rule
- **Customizable Budget Preferences**: Adjust the distribution percentages to fit your financial situation
- **Category Management**: Organize transactions by Needs, Wants, and Savings categories
- **Dashboard**: Visualize your spending patterns and budget adherence
- **Multi-Currency Support**: Track transactions in different currencies
- **Recipient Management**: Save and reuse frequent payment recipients

## API Endpoints

The backend provides the following API endpoints:

- **Authentication**: `/api/auth/*` - User authentication and budget preferences
- **Transactions**: `/api/transactions/*` - CRUD operations for transactions and income distribution
- **Categories**: `/api/categories/*` - CRUD operations for transaction categories
- **Recipients**: `/api/recipients/*` - Manage frequent transaction recipients
- **Utilities**: `/api/utils/*` - Currency conversion and other utility functions

## Budget Management

### 50-30-20 Rule

UMoney implements the popular 50-30-20 budgeting rule:

- **50% for Needs**: Essential expenses like rent, utilities, groceries, and minimum debt payments
- **30% for Wants**: Non-essential expenses like dining out, entertainment, and shopping
- **20% for Savings**: Savings, investments, and additional debt payments

When you add income in UMoney, the application automatically distributes the amount according to these percentages (or your custom percentages).

### Customizable Budget Preferences

You can customize the default distribution percentages in the Settings page:

1. Navigate to Settings
2. Scroll to the Budget Preferences section
3. Adjust the percentages for Needs, Wants, and Savings
4. Ensure the total equals 100%
5. Click "Update Budget Preferences"

### Income Distribution Options

When adding income, you have two options:

1. **Distribute According to Preferences**: The income will be split based on your budget percentages
2. **Save All to Savings**: The entire amount will be allocated to your Savings category

### Budget Visualization

UMoney provides visual representations of your budget and spending patterns:

1. **Progress Bars**: Show your spending in each category compared to your target percentages
2. **Pie Chart**: Displays the distribution of your spending across Needs, Wants, and Savings
3. **Transaction Tables**: List your recent transactions with color-coded amounts
4. **Summary Cards**: Show your total income, expenses, and balance at a glance

These visualizations help you quickly understand your financial situation and identify areas where you might be overspending.

## Development

### Backend Development

The backend uses:
- Express.js for the API server
- Mongoose for MongoDB object modeling
- Passport.js for authentication
- JWT for API authentication

### Frontend Development

The frontend uses:
- React.js for the UI framework
- PrimeReact for UI components and styling
- PrimeFlex for responsive grid layout
- React Router for navigation
- Context API for state management
- Chart.js for data visualization (via PrimeReact Charts)

## Testing

UMoney includes comprehensive test suites for both backend and frontend code. For detailed testing instructions, see:

- [TESTING.md](TESTING.md) - Complete testing guide
- [INCREMENTAL_TESTING.md](INCREMENTAL_TESTING.md) - Guide for running targeted tests based on changes

### Running Tests

#### Backend Tests

```bash
cd umoney-backend

# Run all tests
npm test

# Run specific test suites
npm run test:utils     # Test transaction utility functions
npm run test:routes    # Test API routes

# Run tests for specific functions
npm run test:distribute  # Test income distribution
npm run test:update      # Test transaction updates
npm run test:delete      # Test transaction deletion

# Run tests in watch mode
npm run test:watch
```

#### Frontend Tests

```bash
cd umoney-frontend

# Run all tests
npm test

# Run specific component tests
npm run test:transaction-page
npm run test:dashboard
npm run test:transaction-form

# Run integration tests
npm run test:integration

# Run tests related to distribution functionality
npm run test:distribution
```

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically run relevant tests before each commit. This ensures that your changes don't break existing functionality.

#### UI Components

UMoney uses PrimeReact components throughout the application for a consistent and modern user experience:

- **Layout**: Card, Dialog, Divider, TabMenu
- **Form Controls**: InputText, InputNumber, Dropdown, Calendar, Checkbox
- **Data Display**: DataTable, Chart, ProgressBar
- **Feedback**: Toast, ProgressSpinner
- **Buttons**: Button, FileUpload
- **Overlays**: Dialog, Tooltip

The application uses PrimeFlex CSS utility classes for responsive layouts and styling, making it mobile-friendly and easy to maintain.

## Security Best Practices

### Environment Variables

- **Never commit your `.env` file to version control**
- Use strong, unique values for JWT_SECRET and SESSION_SECRET
- Rotate secrets periodically in production environments
- Use different secrets for development, testing, and production environments

### JWT Security

- The application requires JWT_SECRET to be set as an environment variable
- There are no hardcoded fallback values for security reasons
- JWT tokens are set to expire after 24 hours
- Use HTTPS in production to protect token transmission

### Authentication

- Google OAuth is implemented with proper security measures
- JWT tokens are used for API authentication
- Session management includes security best practices
- Always keep your OAuth credentials secure

## Troubleshooting

### Port Conflicts

If port 3000 is already in use, you can kill the process using:

```bash
npm run kill-port
```

Or restart the service with:

```bash
npm run restart-service
```

### Authentication Issues

If you encounter authentication issues:

1. Ensure your Google OAuth credentials are correctly set up
2. Check that the redirect URIs match exactly
3. Verify that your `.env` file contains the correct credentials
4. Check that JWT_SECRET and SESSION_SECRET are properly set

## License

This project is licensed under the ISC License.