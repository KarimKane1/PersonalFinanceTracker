# Disable Email Confirmation for Testing

To avoid rate limiting while testing, you can temporarily disable email confirmation in Supabase.

## Steps to Disable Email Confirmation

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Disable Email Confirmation**
   - Go to **Authentication** → **Providers** → **Email**
   - Find the setting **"Enable email confirmations"**
   - **Uncheck** this option
   - Click **Save**

3. **Test Your App**
   - Now when you sign up, users will be automatically logged in without needing to confirm their email
   - No more rate limiting issues during testing!

## Re-enable for Production

When you're ready to deploy to production:

1. Go back to **Authentication** → **Providers** → **Email**
2. **Check** the "Enable email confirmations" option
3. Click **Save**

This ensures that in production, users must verify their email addresses for security.

## Alternative: Use Different Emails

If you want to keep email confirmation enabled but avoid rate limits:
- Use different email addresses for each test signup
- Wait 1-2 hours between signups with the same email
- Use email aliases (e.g., `yourname+test1@email.com`, `yourname+test2@email.com`)

## Rate Limit Information

Supabase has rate limits to prevent abuse:
- **Free tier**: Limited number of emails per hour
- **Rate limits reset**: Usually after 1-2 hours
- **Solution**: Disable email confirmation for testing, or wait for the limit to reset

