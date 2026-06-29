# OrbitDesk Configuration Guide

## Environment Variables Setup

The backend uses environment variables loaded from the `.env` file in `src/Backend/OrbitDesk.Api/`. This file is **not committed to git** for security reasons.

### Quick Setup

1. **Copy the template**: 
   ```bash
   cp src/Backend/OrbitDesk.Api/.env.example src/Backend/OrbitDesk.Api/.env
   ```

2. **Fill in your credentials** in the `.env` file (see sections below)

3. **Run the backend**:
   ```bash
   cd src/Backend/OrbitDesk.Api
   dotnet run --urls http://localhost:5298
   ```

---

## SMTP Email Configuration (Gmail)

For email verification and password reset tokens.

### Steps:

1. **Enable 2-Step Verification** on your Google Account:
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your platform)
   - Google will generate a 16-character password

3. **Update `.env`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM_EMAIL=noreply@orbitdesk.com
   SMTP_FROM_NAME=OrbitDesk
   ```

### Testing:
- Password reset will now send real emails
- If SMTP is not configured, tokens are logged to console for testing

---

## Google OAuth Configuration

For "Sign in with Google" functionality.

### Steps:

1. **Create OAuth App**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project: "OrbitDesk"
   - Go to "APIs & Services" → "OAuth consent screen"
   - Configure consent screen (External, add required info)

2. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:5173
     http://localhost:5173/auth/callback/google
     http://localhost:5298
     ```
   - Save Client ID and Client Secret

3. **Update `.env`**:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google
   ```

---

## GitHub OAuth Configuration

For "Sign in with GitHub" functionality.

### Steps:

1. **Create OAuth App**:
   - Go to [github.com/settings/developers](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in:
     - **Application name**: OrbitDesk
     - **Homepage URL**: http://localhost:5173
     - **Authorization callback URL**: http://localhost:5173/auth/callback/github

2. **Get Credentials**:
   - After creation, copy "Client ID" and generate "Client Secret"

3. **Update `.env`**:
   ```env
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback/github
   ```

---

## JWT Configuration

Customize JWT token settings (optional, defaults already set):

```env
JWT_SECRET=your-secret-key-min-32-chars
JWT_ISSUER=OrbitDesk
JWT_AUDIENCE=OrbitDeskUsers
JWT_EXPIRY_MINUTES=120
```

---

## Database Configuration

Override the default SQL Server connection (optional):

```env
DB_CONNECTION_STRING=Server=your-server;Database=orbitdeskdb;Trusted_Connection=True;TrustServerCertificate=True;
```

---

## Production Deployment

For production, use your hosting provider's secrets management:
- **Azure**: Key Vault
- **AWS**: Secrets Manager
- **Docker**: Environment variable injection
- **Platform**: Use environment variable configuration UI

Never commit `.env` to git. Use the `.env.example` as documentation.

---

## Troubleshooting

### SMTP Connection Failed
- Verify credentials and "App Password" (not regular password)
- Check firewall allows port 587

### Google OAuth Not Working
- Verify redirect URIs match frontend URL exactly
- Ensure OAuth app is not in restricted mode

### GitHub OAuth Not Working
- Check Client ID and Secret are correct
- Verify Authorization callback URL matches frontend

### Tokens Not Showing in Email
- If SMTP not configured, check backend console output for token value
- Use token directly in frontend for testing
