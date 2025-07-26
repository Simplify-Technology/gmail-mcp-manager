# Security Guide for Gmail MCP Manager

## 🔐 Credential Security

This guide explains how to securely configure the Gmail MCP Manager to protect your sensitive OAuth2 credentials.

## ⚠️ Security Warning

**NEVER commit real credentials to version control!** The configuration files in this repository use placeholder values for security.

## 🛡️ Secure Setup Instructions

### Option 1: Using Environment Variables (Recommended)

The most secure approach is to set environment variables in your system:

```bash
# Set environment variables (Linux/macOS)
export GOOGLE_CLIENT_ID="your_actual_client_id_here"
export GOOGLE_CLIENT_SECRET="your_actual_client_secret_here"
export GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"
export CONTEXT7_ENABLED="true"
```

```powershell
# Set environment variables (Windows PowerShell)
$env:GOOGLE_CLIENT_ID="your_actual_client_id_here"
$env:GOOGLE_CLIENT_SECRET="your_actual_client_secret_here"
$env:GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"
$env:CONTEXT7_ENABLED="true"
```

Then use the configuration file as-is with placeholder values. The MCP server will automatically read from environment variables.

### Option 2: Using a Local .env File

1. Create a `.env` file in your project root (this file is already in .gitignore):

```bash
# .env file (NOT committed to version control)
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
CONTEXT7_ENABLED=true
```

2. The MCP server will automatically load these variables when it starts.

### Option 3: Using a Private Configuration File

1. Copy the example configuration:
```bash
cp mcp-server-config.example.json mcp-server-config.private.json
```

2. Edit `mcp-server-config.private.json` with your real credentials:
```json
{
  "gmail": {
    "command": "npx",
    "args": [
      "-y",
      "--package=@cristiano-morgante/gmail-mcp-manager@1.3.3",
      "gmail-mcp-server"
    ],
    "env": {
      "GOOGLE_CLIENT_ID": "your_actual_client_id_here",
      "GOOGLE_CLIENT_SECRET": "your_actual_client_secret_here",
      "GOOGLE_REDIRECT_URI": "http://localhost:3000/oauth2callback",
      "CONTEXT7_ENABLED": "true"
    },
    "working_directory": null
  }
}
```

3. Add the private config to .gitignore:
```bash
echo "mcp-server-config.private.json" >> .gitignore
```

4. Use the private configuration file with your MCP client.

## 🔑 Getting OAuth2 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set the redirect URI to `http://localhost:3000/oauth2callback`
7. Copy the Client ID and Client Secret

## 🚨 Security Best Practices

### ✅ DO:
- Use environment variables or private config files
- Keep credentials in `.env` files (already in .gitignore)
- Use different credentials for development and production
- Regularly rotate your OAuth2 credentials
- Review who has access to your Google Cloud project

### ❌ DON'T:
- Commit real credentials to version control
- Share credentials in chat/email
- Use production credentials for development
- Store credentials in public repositories
- Include credentials in screenshots or documentation

## 📁 Configuration Files

This project includes two configuration files:

### `mcp-server-config.example.json` (Template - Safe for Version Control)
- **Purpose**: Template file with placeholder values
- **Usage**: Reference for creating your own configuration
- **Security**: Safe to commit and share (contains no real credentials)
- **Location**: Included in git repository and npm package

### `mcp-server-config.json` (Your Private Configuration - Protected)
- **Purpose**: Your actual configuration with real credentials
- **Usage**: Copy from example and add your real OAuth2 credentials
- **Security**: **PROTECTED** - excluded from git and npm
- **Location**: Local only, never committed or published

## 🔍 Files Protected by .gitignore

The following files are automatically excluded from version control:

- `.env*` - Environment variable files
- `*tokens*.json` - OAuth token storage files
- `.gmail-mcp-tokens.json` - Gmail-specific token files
- `mcp-server-config.json` - **Main configuration file with real credentials**
- `mcp-server-config.private.json` - Private configuration files (if added)

## 🛠️ Troubleshooting

### "Missing required environment variables" Error

This means the MCP server cannot find your credentials. Ensure you have set:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Authentication Failures

1. Verify your credentials are correct
2. Check that the redirect URI matches your Google Cloud Console settings
3. Ensure the Gmail API is enabled in your Google Cloud project
4. Check that your OAuth consent screen is properly configured

## 📞 Support

If you encounter security-related issues:

1. **DO NOT** include real credentials in issue reports
2. Use placeholder values when sharing configuration examples
3. Report security vulnerabilities privately to the maintainers

## 📝 Example MCP Client Configuration

Here's how to configure your MCP client securely:

```json
{
  "gmail": {
    "command": "npx",
    "args": [
      "-y",
      "--package=@cristiano-morgante/gmail-mcp-manager@1.3.3",
      "gmail-mcp-server"
    ],
    "env": {
      "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
      "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}",
      "GOOGLE_REDIRECT_URI": "http://localhost:3000/oauth2callback",
      "CONTEXT7_ENABLED": "true"
    },
    "working_directory": null
  }
}
```

Note: Some MCP clients support environment variable substitution with `${VAR_NAME}` syntax.