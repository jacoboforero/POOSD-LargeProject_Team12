# Email Setup Guide

## Overview
The application now sends OTP verification codes via email for all authentication scenarios:
- **Registration**: Welcome email with verification code
- **Login**: Login verification email
- **Password Reset**: Password reset email

## Email Configuration

### 1. Update Environment Variables

Edit your `/backend/.env` file and configure these SMTP settings:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
VERIFIED_DOMAIN=poosdproj.xyz   # used in the "from" address
```

### 2. Gmail Setup (Recommended)

If using Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this as `SMTP_PASS` in your .env file

3. **Update .env**:
   ```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
VERIFIED_DOMAIN=yourdomain.com
```

### 3. Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
VERIFIED_DOMAIN=yourdomain.com
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
VERIFIED_DOMAIN=yourdomain.com
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
VERIFIED_DOMAIN=yourdomain.com
```

## Email Templates

The application includes three email templates:

### 1. Registration Email
- **Subject**: "Welcome to IntelliBrief - Verify Your Email"
- **Content**: Welcome message with 6-digit verification code
- **Expiry**: 10 minutes

### 2. Login Email
- **Subject**: "IntelliBrief - Login Verification Code"
- **Content**: Login verification message with 6-digit code
- **Expiry**: 10 minutes

### 3. Password Reset Email
- **Subject**: "IntelliBrief - Password Reset Code"
- **Content**: Password reset message with 6-digit code
- **Expiry**: 10 minutes

## Testing

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test registration flow**:
   - Enter email on webapp or mobile app
   - Complete onboarding questions
   - Check email for verification code
   - Enter code to complete registration

3. **Test login flow**:
   - Enter email and password
   - Check email for verification code
   - Enter code to log in

4. **Test password reset flow**:
   - Click "Forgot password?"
   - Check email for reset code
   - Enter code and new password

## Troubleshooting

### Email Not Sending
- Check your SMTP credentials in .env
- Verify firewall/network allows SMTP connections
- Check backend console for error messages
- Ensure email service allows "less secure apps" or use app passwords

### Gmail Specific Issues
- Make sure 2FA is enabled
- Use App Password, not regular password
- Check "Less secure app access" is allowed (if not using 2FA)

### Fallback Behavior
If email sending fails, the backend will:
1. Log the error to console
2. Show the OTP code in backend console (development fallback)
3. Return an error to the client

## User-Facing Changes

### Frontend Webapp
- ✅ Updated "Check your backend console" → "Check your email"
- ✅ All verification screens now reference email

### Mobile App
- ✅ Updated "Check your backend console" → "Check your email"
- ✅ All verification screens now reference email
- ✅ Success messages indicate email has been sent

## Files Modified

### Backend
- `backend/src/services/emailService.ts` - New email service
- `backend/src/services/authService.ts` - Integrated email sending
- `backend/.env` - Added SMTP configuration
- `backend/.env.example` - Added SMTP config template

### Frontend Webapp
- `frontend/src/components/VerifyOtp.tsx` - Updated messages
- `frontend/src/components/ForgotPassword.tsx` - Updated messages

### Mobile App
- `frontend_mobile/lib/screens/auth_screen.dart` - Updated messages
- `frontend_mobile/lib/screens/forgot_password_screen.dart` - Updated messages
- `frontend_mobile/lib/screens/onboarding_screen.dart` - Added success message

## Security Notes

- OTP codes are hashed in database using bcrypt
- Codes expire after 10 minutes
- Maximum 5 verification attempts per code
- Passwords are hashed with bcrypt (10 rounds)
- SMTP credentials should be kept secure (never commit to git)
- Use app-specific passwords for Gmail/Yahoo

## Next Steps

1. Configure your SMTP settings in backend/.env
2. Restart the backend server
3. Test the email flows on both webapp and mobile
4. Monitor backend console for any email errors
5. Consider rate limiting for production (already implemented for API routes)
