# Supabase Email Confirmation Configuration

To enable email confirmation links to work properly, you need to configure the redirect URL in your Supabase project.

## Steps to Configure Email Confirmation

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Configure Authentication Settings**
   - Go to **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add your production URL:
     ```
     https://karimkane1.github.io/PersonalFinanceTracker/
     ```
   - Also add the local development URL (optional):
     ```
     http://localhost:5173
     ```

3. **Enable Email Confirmation (if not already enabled)**
   - Go to **Authentication** → **Providers** → **Email**
   - Make sure **Enable email confirmations** is checked
   - This ensures users must verify their email before they can sign in

4. **Configure Email Templates (Recommended)**
   - Go to **Authentication** → **Email Templates**
   - Select **"Confirm signup"** template
   - Replace with the custom template from `SUPABASE_EMAIL_TEMPLATE.md`
   - This provides clear instructions and branding for Personal Finance Tracker
   - The confirmation link will automatically use the redirect URL you configured

## How It Works

1. User signs up with email and password
2. Supabase sends a confirmation email with a link
3. User clicks the link in their email
4. Supabase redirects them back to your app with authentication tokens
5. The app detects these tokens and automatically logs the user in
6. User is redirected to the main app

## Testing

1. Sign up with a new email
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. You should be automatically logged in and redirected to the app

## Troubleshooting

- **Link doesn't work**: Make sure the redirect URL is exactly correct in Supabase settings
- **Link redirects to wrong page**: Check that the URL in Supabase matches your deployed URL
- **Email not received**: Check spam folder, and verify email provider isn't blocking Supabase emails

