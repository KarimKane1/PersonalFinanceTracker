# Supabase Setup Instructions

Follow these steps to set up Supabase for your Personal Finance App:

## 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (PersonalFinanceTracker)
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## 2. Create Environment Variables

1. In your project root, create a file named `.env` (copy from `.env.example` if it exists)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit the `.env` file to Git! It's already in `.gitignore`.

## 3. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

This will create:
- The `finance_data` table
- Row Level Security (RLS) policies
- Automatic timestamp updates

## 4. Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see a table called `finance_data`
3. Click on it to see the structure:
   - `id` (UUID)
   - `user_id` (UUID, references auth.users)
   - `data` (JSONB)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## 5. Test the App

1. Start your development server: `npm run dev`
2. You should see the login/signup screen
3. Create a new account with your email
4. Your data will now sync across all devices!

## How It Works

- **Authentication**: Users sign up/login with email and password
- **Data Storage**: Each user's finance data is stored in Supabase
- **Security**: Row Level Security ensures users can only access their own data
- **Sync**: Data automatically syncs across all devices when logged in

## Troubleshooting

### "Supabase URL and Anon Key must be set"
- Make sure your `.env` file exists in the project root
- Check that the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after creating/updating `.env`

### "Error loading model from Supabase"
- Check that you ran the SQL setup script
- Verify the `finance_data` table exists in your Supabase dashboard
- Check the browser console for detailed error messages

### "Users can only see their own data" error
- Make sure you ran the complete SQL setup script
- Check that Row Level Security policies are enabled in Supabase dashboard

## Free Tier Limits

Supabase free tier includes:
- 500MB database storage
- 2GB bandwidth/month
- 50,000 monthly active users
- Unlimited API requests

This is more than enough for personal use!

