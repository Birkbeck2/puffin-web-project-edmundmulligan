# Quick Start Guide: API Setup

## Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

## Setup Steps

### 1. Install Dependencies

Run this command in the project root:

```bash
npm install
```

This will install the new dependencies:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `nodemailer` - Email sending
- `dotenv` - Environment variable management

### 2. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

For **development/testing** (emails will be logged to console):

```env
NODE_ENV=development
PORT=3000
STATIC_PORT=8000
EMAIL_PROVIDER=console
EMAIL_FROM=noreply@embodied-mind.org
```

For **production** (real emails via Gmail):

```env
NODE_ENV=production
PORT=3000
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@embodied-mind.org
```

**Note**: For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833) instead of using your regular password.

### 3. Start the Servers

You need to run **both** the static site server and the API server:

**Terminal 1 - Static Site:**
```bash
npm run dev
```
This starts the website on `http://localhost:8000`

**Terminal 2 - API Server:**
```bash
npm run api
```
This starts the API on `http://localhost:3000`

### 4. Test the Setup

1. **Health Check**: Visit `http://localhost:3000/api/health` in your browser. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": 123
   }
   ```

2. **Feedback Form**: 
   - Go to `http://localhost:8000/pages/feedback.html`
   - Fill out the form
   - Submit feedback
   - In **development mode**, check the API server console for the email preview
   - In **production mode**, check your email inbox

## Common Issues

### "Cannot GET /api/send-feedback"

- Make sure the API server is running (`npm run api`)
- Check that it's running on port 3000
- Look for the startup message: `🚀 API Server running on http://localhost:3000`

### CORS Errors

- Ensure both servers are running
- Check that the static site is on port 8000
- Verify `.env` has `STATIC_PORT=8000`

### "Email service not configured properly"

- In development: Set `EMAIL_PROVIDER=console` in `.env`
- In production: Set all SMTP_ variables in `.env`
- Verify SMTP credentials are correct

### Form submits but no email

- Check the API server console for errors
- In development mode, email content is logged to console
- In production mode, verify SMTP settings

## Email Provider Setup

### Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Google account
2. Create an [App Password](https://support.google.com/accounts/answer/185833)
3. Use in `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### SendGrid (Recommended for Production)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Use in `.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get SMTP credentials
3. Use in `.env`:
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-username
   SMTP_PASS=your-mailgun-password
   ```

## Production Deployment

### Deploying the API

The API can be deployed to:
- **Heroku**: Free tier available
- **Railway**: Easy deployment
- **Render**: Free tier available
- **DigitalOcean App Platform**: $5/month
- **AWS/GCP/Azure**: Various options

See `api/README.md` for detailed deployment instructions.

### Updating the Frontend

When deploying to production, update the API URL in `scripts/feedbackForm.js` if your API is on a different domain:

```javascript
const apiUrl = 'https://your-api-domain.com/api/send-feedback';
```

Or use environment-based detection (already implemented):
```javascript
const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api/send-feedback'
  : 'https://web.witchcraft-and-wizardry.school/api/send-feedback';
```

## What's Included

### Backend Files
- `api/server.js` - Express server
- `api/routes/feedback.js` - Feedback endpoint
- `api/services/emailService.js` - Email sending logic
- `api/validators/feedbackValidator.js` - Input validation
- `api/README.md` - Detailed API documentation

### Frontend Updates
- `scripts/feedbackForm.js` - Updated to use real API
- `styles/pages/feedback.css` - Modal styling

### Configuration
- `.env.example` - Environment template
- `package.json` - New dependencies and scripts
- `.gitignore` - Excludes `.env` files

## Next Steps

1. **Test in Development**: Run both servers and test the feedback form
2. **Configure Email**: Set up your SMTP provider
3. **Test Email Sending**: Switch to production mode and send a test email
4. **Deploy**: Follow `api/README.md` for deployment options
5. **Monitor**: Check logs for any issues

## Support

For more detailed information, see:
- `api/README.md` - Complete API documentation
- `documentation/feedback-email-integration.md` - Integration guide

## Security Reminders

- ✅ Never commit `.env` files
- ✅ Use App Passwords, not regular passwords
- ✅ Enable 2FA on email accounts
- ✅ Use environment variables for sensitive data
- ✅ Keep dependencies updated
