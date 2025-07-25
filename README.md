# Gmail MCP Server

[![npm version](https://badge.fury.io/js/@mcp%2Fgmail-manager.svg)](https://badge.fury.io/js/@mcp%2Fgmail-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A complete **MCP (Model Context Provider) Server** for Gmail API management with OAuth2 authentication and Context7 integration. This package provides both a **CLI interface** and a **programmatic API** for managing Gmail operations with automatic documentation integration.

## ✨ Features

- 🔐 **OAuth2 Authentication** with automatic token refresh
- 📧 **Complete Email Management** (send, read, search, organize)
- 📝 **Draft Management** (create, update, send drafts)
- 🏷️ **Label Management** and organization
- 📦 **Batch Operations** for efficient bulk actions
- 🧵 **Thread Management** for conversation handling
- 📚 **Context7 Integration** for automatic documentation
- 🖥️ **CLI Interface** for terminal usage
- 📦 **NPM Package** for programmatic integration
- 🔒 **Secure Token Storage** with proper permissions
- ⚡ **TypeScript Support** with full type definitions

## 🚀 Quick Start

### Installation

```bash
# Install globally for CLI usage
npm install -g @mcp/gmail-manager

# Or install locally for programmatic usage
npm install @mcp/gmail-manager
```

### Setup

1. **Get Google OAuth2 Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create OAuth2 credentials (Desktop application)
   - Download the credentials

2. **Configure Environment**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your credentials
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

3. **Authenticate**
   ```bash
   # CLI authentication
   gmail-mcp auth login
   
   # Or programmatically (will prompt for auth)
   node -e "import('@mcp/gmail-manager').then(({createFromEnvironment}) => createFromEnvironment().initialize())"
   ```

## 📖 Usage

### CLI Usage

#### Authentication
```bash
# Login with Google OAuth2
gmail-mcp auth login

# Check authentication status
gmail-mcp auth status

# Logout and revoke tokens
gmail-mcp auth logout
```

#### Message Management
```bash
# List recent messages
gmail-mcp messages list

# List unread messages
gmail-mcp messages list --query "is:unread"

# List messages with attachments
gmail-mcp messages list --query "has:attachment" --max 20

# Get specific message details
gmail-mcp messages get MESSAGE_ID

# Send an email (interactive)
gmail-mcp messages send
```

#### Draft Management
```bash
# List drafts
gmail-mcp drafts list

# Create a new draft (interactive)
gmail-mcp drafts create

# Send a draft
gmail-mcp drafts send DRAFT_ID
```

#### Batch Operations
```bash
# Mark messages as read
gmail-mcp batch mark-read MSG_ID1 MSG_ID2 MSG_ID3

# Archive messages
gmail-mcp batch archive MSG_ID1 MSG_ID2
```

#### Utility Commands
```bash
# List all labels
gmail-mcp labels

# Show email statistics
gmail-mcp stats

# Context7 documentation
gmail-mcp context7 status
gmail-mcp context7 get sendMessage
gmail-mcp context7 clear-cache
```

### Programmatic Usage

#### Basic Example
```javascript
import { createFromEnvironment } from '@mcp/gmail-manager';

async function example() {
  // Create manager from environment variables
  const manager = createFromEnvironment();
  
  // Initialize (handles authentication)
  await manager.initialize();
  
  // List recent messages
  const messages = await manager.listMessages({
    maxResults: 10,
    query: 'is:unread'
  });
  
  // Send an email
  const email = {
    to: ['recipient@example.com'],
    subject: 'Hello from Gmail MCP!',
    body: 'This email was sent using Gmail MCP Server.',
    isHtml: false
  };
  
  const sentMessage = await manager.sendMessage(email);
  console.log('Email sent:', sentMessage.id);
}
```

#### Advanced Configuration
```javascript
import { GmailMCPManager, GMAIL_SCOPES } from '@mcp/gmail-manager';

const config = {
  oauth2: {
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
    redirectUri: 'http://localhost:3000/oauth2callback',
    scopes: [GMAIL_SCOPES.MODIFY, GMAIL_SCOPES.COMPOSE]
  },
  defaultUserId: 'me',
  context7Enabled: true,
  tokenStoragePath: './custom-tokens.json'
};

const manager = new GmailMCPManager(config);
await manager.initialize();
```

#### Context7 Integration
```javascript
// Get documentation for specific operations
const docs = await manager.getDocumentation('sendMessage', 'HTML email');
console.log('Documentation:', docs.documentation);
console.log('Examples:', docs.examples);

// Get documentation as code comments
const comments = await manager.getDocumentationAsComments('listMessages');
console.log(comments);
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | ✅ | - | Google OAuth2 Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | - | Google OAuth2 Client Secret |
| `GOOGLE_REDIRECT_URI` | ❌ | `http://localhost:3000/oauth2callback` | OAuth2 redirect URI |
| `GOOGLE_SCOPES` | ❌ | `gmail.modify` | Comma-separated Gmail scopes |
| `TOKEN_STORAGE_PATH` | ❌ | `~/.gmail-mcp-tokens.json` | Token storage file path |
| `DEFAULT_USER_ID` | ❌ | `me` | Default Gmail user ID |
| `CONTEXT7_ENABLED` | ❌ | `true` | Enable Context7 integration |

### Gmail Scopes

Available scopes (use `GMAIL_SCOPES` constants):

- `GMAIL_SCOPES.READONLY` - Read-only access
- `GMAIL_SCOPES.MODIFY` - Read/write access (recommended)
- `GMAIL_SCOPES.COMPOSE` - Compose and send emails
- `GMAIL_SCOPES.SEND` - Send emails only
- `GMAIL_SCOPES.LABELS` - Manage labels
- `GMAIL_SCOPES.SETTINGS_BASIC` - Basic settings access

## 📚 API Reference

### GmailMCPManager

#### Core Methods

```typescript
// Initialization
await manager.initialize(): Promise<void>

// Message operations
await manager.listMessages(options?: EmailListOptions): Promise<ListMessagesResponse>
await manager.getMessage(messageId: string, format?: 'full' | 'metadata' | 'minimal'): Promise<GmailMessage>
await manager.sendMessage(email: EmailComposition): Promise<GmailMessage>

// Draft operations
await manager.createDraft(email: EmailComposition): Promise<GmailDraft>
await manager.updateDraft(draftId: string, email: EmailComposition): Promise<GmailDraft>
await manager.sendDraft(draftId: string): Promise<GmailMessage>
await manager.listDrafts(maxResults?: number, pageToken?: string): Promise<ListDraftsResponse>

// Batch operations
await manager.performBatchOperation(operation: BatchOperation): Promise<void>

// Utility methods
await manager.getLabels(): Promise<ListLabelsResponse>
await manager.getEmailStats(): Promise<EmailStats>
await manager.getThread(threadId: string, format?: string): Promise<GmailThread>
await manager.listThreads(options?: EmailListOptions): Promise<ListThreadsResponse>

// Authentication
await manager.logout(): Promise<void>
await manager.getTokenInfo(): Promise<any>

// Context7 integration
await manager.getDocumentation(operation: string, context?: string): Promise<Context7Response | null>
await manager.getDocumentationAsComments(operation: string, context?: string): Promise<string>
manager.enableContext7(): void
manager.disableContext7(): void
manager.clearContext7Cache(): void
manager.getContext7Stats(): { size: number; keys: string[] }
```

#### Types

```typescript
interface EmailComposition {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: EmailAttachment[];
}

interface EmailListOptions {
  query?: string;
  labelIds?: string[];
  maxResults?: number;
  pageToken?: string;
  includeSpamTrash?: boolean;
  userId?: string;
}

interface BatchOperation {
  messageIds: string[];
  action: 'read' | 'unread' | 'archive' | 'delete' | 'trash' | 'spam';
  labelIds?: string[];
}
```

## 🔍 Advanced Features

### Search Queries

Gmail MCP supports advanced search queries:

```javascript
// Search examples
await manager.listMessages({ query: 'is:unread' });
await manager.listMessages({ query: 'from:important@company.com' });
await manager.listMessages({ query: 'has:attachment subject:invoice' });
await manager.listMessages({ query: 'is:starred newer_than:7d' });
await manager.listMessages({ query: 'label:important OR label:urgent' });
```

### Batch Operations

Efficiently process multiple messages:

```javascript
const operation = {
  messageIds: ['msg1', 'msg2', 'msg3'],
  action: 'archive'
};

await manager.performBatchOperation(operation);
```

### HTML Emails with Attachments

```javascript
const email = {
  to: ['recipient@example.com'],
  subject: 'Report with Attachment',
  body: '<h1>Monthly Report</h1><p>Please find the report attached.</p>',
  isHtml: true,
  attachments: [
    {
      filename: 'report.pdf',
      content: fileBuffer, // Buffer or base64 string
      contentType: 'application/pdf'
    }
  ]
};

await manager.sendMessage(email);
```

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/mcp/gmail-manager.git
cd gmail-manager

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Project Structure

```
src/
├── auth.service.ts      # OAuth2 authentication
├── gmail.service.ts     # Gmail API operations
├── context7.ts          # Context7 integration
├── index.ts             # Main module exports
├── cli.ts               # CLI interface
└── types.ts             # TypeScript definitions

examples/
├── basic-usage.js       # Basic usage example
└── advanced-usage.js    # Advanced features example
```

## 🔒 Security

- **Token Storage**: Tokens are stored with `600` permissions (owner read/write only)
- **Environment Variables**: Never commit `.env` files to version control
- **Scopes**: Use minimal required scopes for your use case
- **HTTPS**: Always use HTTPS redirect URIs in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)
- [Context7 MCP](https://github.com/upstash/context7-mcp)
- [Commander.js](https://github.com/tj/commander.js)

## 📞 Support

- 📖 [Documentation](https://github.com/mcp/gmail-manager#readme)
- 🐛 [Issue Tracker](https://github.com/mcp/gmail-manager/issues)
- 💬 [Discussions](https://github.com/mcp/gmail-manager/discussions)

---

**Made with ❤️ for the MCP ecosystem**