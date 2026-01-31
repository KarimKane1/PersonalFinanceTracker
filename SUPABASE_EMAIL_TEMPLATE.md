# Supabase Email Confirmation Template

Copy this template into your Supabase email confirmation settings.

## Steps to Update Email Template

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Email Templates**
3. Find **"Confirm signup"** template
4. Replace the entire template with the content below
5. Click **Save**

## Email Template

**Subject:**
```
Confirm your Personal Finance Tracker account
```

**Body (HTML):**
```html
<h2>Welcome to Personal Finance Tracker!</h2>

<p>Thank you for signing up! To complete your account setup, please confirm your email address by clicking the link below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Confirm Your Email</a></p>

<p><strong>What happens next?</strong></p>
<ol>
  <li>Click the "Confirm Your Email" button above</li>
  <li>You'll be redirected to the Personal Finance Tracker app</li>
  <li>You'll be automatically logged in and can start using the app!</li>
</ol>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #2563eb;">{{ .ConfirmationURL }}</p>

<p>If you didn't sign up for Personal Finance Tracker, you can safely ignore this email.</p>

<p>Happy budgeting! 💰</p>
<p><em>— The Personal Finance Tracker Team</em></p>
```

**Body (Plain Text - Alternative):**
```
Welcome to Personal Finance Tracker!

Thank you for signing up! To complete your account setup, please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

What happens next?
1. Click the link above
2. You'll be redirected to the Personal Finance Tracker app
3. You'll be automatically logged in and can start using the app!

If you didn't sign up for Personal Finance Tracker, you can safely ignore this email.

Happy budgeting! 💰
— The Personal Finance Tracker Team
```

## Notes

- The `{{ .ConfirmationURL }}` is a Supabase variable that will be automatically replaced with the actual confirmation link
- The HTML version includes styling for a nice button
- The plain text version is a fallback for email clients that don't support HTML
- Both versions clearly explain what the user needs to do

