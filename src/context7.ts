/**
 * Context7 Integration Service for Gmail MCP Server
 * Automatically fetches relevant documentation based on functionality being used
 */

import type { Context7Response } from './types.js';

export class Context7Service {
  private enabled: boolean;
  private cache: Map<string, Context7Response> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * ✅ **Get relevant documentation for Gmail API functionality**
   * **Source**: Context7 MCP integration
   * **Functionality**: Fetches up-to-date documentation based on operation context
   * **Performance**: Implements caching to avoid repeated API calls
   */
  async getRelevantDocumentation(
    operation: string,
    context?: string
  ): Promise<Context7Response | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const cacheKey = `${operation}-${context || 'default'}`;

      // Check cache first
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        console.log(`📚 Using cached documentation for: ${operation}`);
        return cached;
      }

      console.log(`🔍 Fetching documentation for: ${operation}`);

      // Map operation to relevant search terms
      const searchTerm = this.mapOperationToSearchTerm(operation, context);

      // Simulate Context7 integration (in real implementation, this would call Context7 MCP)
      const documentation = await this.fetchFromContext7(searchTerm);

      // Cache the response
      this.setCachedResponse(cacheKey, documentation);

      console.log(`✅ Documentation fetched and cached for: ${operation}`);
      return documentation;
    } catch (error) {
      console.warn(`⚠️ Failed to fetch documentation for ${operation}:`, error);
      return null; // Don't fail the main operation if documentation fetch fails
    }
  }

  /**
   * ✅ **Display documentation in terminal (CLI mode)**
   * **Functionality**: Shows relevant documentation context in CLI
   */
  displayInTerminal(documentation: Context7Response, operation: string): void {
    if (!documentation) return;

    console.log('\n' + '='.repeat(80));
    console.log(`📖 CONTEXT7 DOCUMENTATION: ${operation.toUpperCase()}`);
    console.log('='.repeat(80));

    if (documentation.documentation) {
      console.log('\n📝 Documentation:');
      console.log(this.formatDocumentationForTerminal(documentation.documentation));
    }

    if (documentation.examples && documentation.examples.length > 0) {
      console.log('\n💡 Examples:');
      documentation.examples.forEach((example, index) => {
        console.log(`\n${index + 1}. ${example}`);
      });
    }

    if (documentation.relevantLinks && documentation.relevantLinks.length > 0) {
      console.log('\n🔗 Relevant Links:');
      documentation.relevantLinks.forEach(link => {
        console.log(`   • ${link}`);
      });
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  /**
   * ✅ **Embed documentation as code comments**
   * **Functionality**: Returns documentation formatted as code comments
   */
  getAsCodeComments(documentation: Context7Response): string {
    if (!documentation) return '';

    let comments = '/**\n';
    comments += ' * CONTEXT7 DOCUMENTATION\n';
    comments += ' * \n';

    if (documentation.documentation) {
      comments += ' * Documentation:\n';
      const lines = documentation.documentation.split('\n');
      lines.forEach(line => {
        comments += ` * ${line}\n`;
      });
      comments += ' * \n';
    }

    if (documentation.examples && documentation.examples.length > 0) {
      comments += ' * Examples:\n';
      documentation.examples.forEach((example, index) => {
        comments += ` * ${index + 1}. ${example}\n`;
      });
      comments += ' * \n';
    }

    if (documentation.relevantLinks && documentation.relevantLinks.length > 0) {
      comments += ' * Relevant Links:\n';
      documentation.relevantLinks.forEach(link => {
        comments += ` * - ${link}\n`;
      });
    }

    comments += ' */';
    return comments;
  }

  /**
   * Map Gmail operations to Context7 search terms
   */
  private mapOperationToSearchTerm(operation: string, context?: string): string {
    const operationMap: Record<string, string> = {
      'authenticate': 'Gmail API OAuth2 authentication',
      'listMessages': 'Gmail API list messages',
      'getMessage': 'Gmail API get message details',
      'sendMessage': 'Gmail API send email',
      'createDraft': 'Gmail API create draft',
      'updateDraft': 'Gmail API update draft',
      'sendDraft': 'Gmail API send draft',
      'listDrafts': 'Gmail API list drafts',
      'batchOperation': 'Gmail API batch modify messages',
      'getLabels': 'Gmail API list labels',
      'getThread': 'Gmail API get thread',
      'listThreads': 'Gmail API list threads',
      'getStats': 'Gmail API mailbox statistics',
    };

    const baseSearch = operationMap[operation] || `Gmail API ${operation}`;
    return context ? `${baseSearch} ${context}` : baseSearch;
  }

  /**
   * Simulate Context7 MCP integration
   * In real implementation, this would use the actual Context7 MCP client
   */
  private async fetchFromContext7(searchTerm: string): Promise<Context7Response> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return mock documentation based on search term
    return this.getMockDocumentation(searchTerm);
  }

  /**
   * Get mock documentation for development/testing
   * In production, this would be replaced by actual Context7 responses
   */
  private getMockDocumentation(searchTerm: string): Context7Response {
    const mockResponses: Record<string, Context7Response> = {
      'Gmail API OAuth2 authentication': {
        documentation: `OAuth2 authentication for Gmail API requires:
1. Client ID and Client Secret from Google Cloud Console
2. Redirect URI configured in OAuth consent screen
3. Appropriate scopes (gmail.modify, gmail.readonly, etc.)
4. Token storage for refresh tokens

Security considerations:
- Store tokens securely with proper file permissions
- Use refresh tokens to avoid repeated authentication
- Implement token expiry checking and automatic refresh`,
        examples: [
          'const authService = new AuthService(config); await authService.authenticate();',
          'const client = AuthService.fromEnvironment(); // Uses .env variables'
        ],
        relevantLinks: [
          'https://developers.google.com/gmail/api/auth/oauth2',
          'https://github.com/googleapis/google-auth-library-nodejs'
        ]
      },
      'Gmail API list messages': {
        documentation: `List messages endpoint allows filtering and pagination:
- Use 'q' parameter for advanced search queries
- Support for label filtering with labelIds
- Pagination with maxResults and pageToken
- includeSpamTrash to include spam/trash messages

Query examples:
- 'is:unread' - unread messages
- 'from:example@gmail.com' - from specific sender
- 'subject:important' - messages with 'important' in subject
- 'has:attachment' - messages with attachments`,
        examples: [
          'await gmail.listMessages({ query: "is:unread", maxResults: 50 })',
          'await gmail.listMessages({ labelIds: ["INBOX"], includeSpamTrash: false })'
        ],
        relevantLinks: [
          'https://developers.google.com/gmail/api/reference/rest/v1/users.messages/list',
          'https://developers.google.com/gmail/api/guides/filtering'
        ]
      },
      'Gmail API send email': {
        documentation: `Send email using raw MIME format:
- Construct proper MIME headers (To, Cc, Bcc, Subject)
- Support for HTML and plain text content
- Attachment handling with base64 encoding
- Proper Content-Type and boundary handling for multipart messages

MIME structure:
1. Headers (To, From, Subject, etc.)
2. Content-Type declaration
3. Message body (text/html or text/plain)
4. Attachments (if any) with proper encoding`,
        examples: [
          'await gmail.sendMessage({ to: ["user@example.com"], subject: "Test", body: "Hello!" })',
          'await gmail.sendMessage({ to: ["user@example.com"], subject: "HTML", body: "<h1>Hello!</h1>", isHtml: true })'
        ],
        relevantLinks: [
          'https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send',
          'https://developers.google.com/gmail/api/guides/sending'
        ]
      }
    };

    // Find the most relevant mock response
    const key = Object.keys(mockResponses).find(k =>
      searchTerm.toLowerCase().includes(k.toLowerCase().split(' ').slice(-2).join(' '))
    );

    return key && mockResponses[key] ? mockResponses[key] : {
      documentation: `Documentation for: ${searchTerm}

This is a placeholder response. In production, Context7 would provide
up-to-date documentation from the official Gmail API documentation.

Key points:
- Always check the official Gmail API documentation
- Use proper error handling for API calls
- Implement rate limiting and retry logic
- Follow security best practices for token handling`,
      examples: [
        'Check official Gmail API documentation for examples',
        'Refer to googleapis Node.js client library documentation'
      ],
      relevantLinks: [
        'https://developers.google.com/gmail/api',
        'https://github.com/googleapis/googleapis'
      ]
    };
  }

  /**
   * Format documentation for terminal display
   */
  private formatDocumentationForTerminal(doc: string): string {
    return doc
      .split('\n')
      .map(line => `   ${line}`)
      .join('\n');
  }

  /**
   * Get cached response if valid
   */
  private getCachedResponse(key: string): Context7Response | null {
    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    // Clean up expired cache
    if (cached) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }

    return null;
  }

  /**
   * Set cached response with expiry
   */
  private setCachedResponse(key: string, response: Context7Response): void {
    this.cache.set(key, response);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear all cached responses
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('🗑️ Context7 cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Enable or disable Context7 integration
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`📚 Context7 integration ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if Context7 is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}