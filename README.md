# Sublyx

A React Native Expo app for tracking subscriptions and managing personal finances.

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