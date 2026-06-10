# Sublyx

## Project Overview
Sublyx is a mobile application developed as a bachelor's diploma project for managing personal subscriptions and recurring expenses.
The application helps users monitor active subscriptions, track upcoming payments, analyse spending habits, and manage subscription-related information in a convenient and user-friendly interface.
The system provides secure authentication, payment tracking, analytics visualization, profile management, multilingual support, and personalized user settings.
##

## Core Functionality

### Subscription Management

- Add new subscriptions
- Edit existing subscriptions
- Delete subscriptions
- Configure billing cycles
- Set reminder preferences

### Payment Tracking

- View upcoming payments
- Track subscription renewal dates
- Monitor recurring expenses

### Analytics

- Spending analytics by category
- Subscription distribution charts
- Payment statistics and insights

### User Profile

- Profile editing
- Avatar upload
- Password reset
- Theme preferences
- Language preferences

### Authentication

- User registration
- Secure login
- Password recovery
- Account deletion

## Technology Stack

### Frontend

- React Native
- Expo
- TypeScript

### Backend Services

- Supabase Authentication
- Supabase Database
- Supabase Storage
- Supabase Edge Functions

### Database

- PostgreSQL (Supabase)

### Development Tools

- VS Code
- Git
- GitHub

## Application Screens

The application consists of the following main screens:

- Dashboard
- Subscriptions
- Calendar
- Analytics
- Profile
- Login & Registration
- Password Recovery
- Reminder Preferences
- Privacy Policy
- Help Center

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file from the provided example template:
   ```bash
   cp .env.example .env
   ```
   *Make sure to fill in your Supabase credentials in the `.env` file.*

3. **Start the app**:
   ```bash
   npx expo start
   ```

## Features

- Add, edit, and delete subscriptions with custom billing cycles
- Comprehensive analytics for spending with dynamic charts
- Real-time calendar view for upcoming payments
- Secure authentication and profile management via Supabase
- Ukrainian and English localization support
- Dark and Light mode themes
- Avatar upload support via Supabase Storage
- Real permanent account deletion (via Supabase Edge Functions)

## Supabase Edge Functions

The **Delete Account** feature completely removes the user from Supabase Authentication. It relies on a secure Supabase Edge Function to protect your Service Role Key from being exposed in the app.

To deploy the edge function:
1. Make sure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked to your project.
2. Deploy the function:
   ```bash
   supabase functions deploy delete-user-account
   ```
3. Set your service role key as a secret for the Edge Function:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
*Important: Never place the Service Role Key directly inside the React Native application. Only add it as a secret to your deployed Edge Function.*

## Troubleshooting

- Ensure Expo CLI is installed.
- For Android/iOS, you can use the Expo Go app on your physical device or set up the respective emulators.
- Ensure your Supabase instance matches the schema provided in `schema.sql`.

## Future Improvements

- Push notifications
- Google Authentication
- Shared subscriptions
- AI-powered spending insights
- Export reports to PDF
- Budget planning tools


## Author

Viktoriia Dolha
Bachelor's Degree Project
Software Engineering
Simon Kuznets Kharkiv National University of Economics
2026
