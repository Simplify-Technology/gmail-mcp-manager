/**
 * Gmail MCP Server - Main Module
 * Complete MCP Server for Gmail API management with OAuth2 authentication and Context7 integration
 *
 * @author MCP Gmail Manager
 * @version 1.0.0
 * @license MIT
 */

// Export all types
export type {
  OAuth2Config,
  TokenData,
  GmailMessage,
  MessagePayload,
  MessageHeader,
  MessageBody,
  GmailThread,
  GmailLabel,
  GmailDraft,
  EmailComposition,
  EmailAttachment,
  EmailSearchOptions,
  EmailListOptions,
  ListMessagesResponse,
  ListThreadsResponse,
  ListLabelsResponse,
  ListDraftsResponse,
  Context7Response,
  GmailMCPConfig,
  CLIOptions,
  EmailAction,
  BatchOperation,
  EmailStats,
} from './types.js';

// Export error classes
export {
  GmailMCPError,
  AuthenticationError,
  APIError,
} from './types.js';

// Export services
export { AuthService } from './auth.service.js';
export { GmailService } from './gmail.service.js';
export { Context7Service } from './context7.js';

// Main Gmail MCP Manager class
import { AuthService } from './auth.service.js';
import { GmailService } from './gmail.service.js';
import { Context7Service } from './context7.js';
import type {
  GmailMCPConfig,
  EmailComposition,
  EmailListOptions,
  BatchOperation,
  GmailMessage,
  GmailDraft,
  ListMessagesResponse,
  ListLabelsResponse,
  EmailStats,
  Context7Response,
} from './types.js';

/**
 * ✅ **Main Gmail MCP Manager Class**
 * **Functionality**: Unified interface for all Gmail operations with Context7 integration
 * **Usage**: Can be used as importable module or via CLI
 * **Security**: Implements secure OAuth2 authentication with token persistence
 */
export class GmailMCPManager {
  private authService: AuthService;
  private gmailService: GmailService;
  private context7Service: Context7Service;

  constructor(config: GmailMCPConfig) {
    this.authService = new AuthService(config);
    this.gmailService = new GmailService(this.authService, config.defaultUserId);
    this.context7Service = new Context7Service(config.context7Enabled);
  }

  /**
   * ✅ **Initialize the Gmail MCP Manager**
   * **Functionality**: Sets up authentication and Gmail API client
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Gmail MCP Manager...');

    // Get Context7 documentation for initialization
    const initDocs = await this.context7Service.getRelevantDocumentation('initialize');
    if (initDocs) {
      this.context7Service.displayInTerminal(initDocs, 'initialize');
    }

    await this.gmailService.initialize();
    console.log('✅ Gmail MCP Manager initialized successfully');
  }

  /**
   * ✅ **List messages with Context7 documentation**
   * **Functionality**: List emails with automatic documentation display
   */
  async listMessages(options: EmailListOptions = {}): Promise<ListMessagesResponse> {
    const docs = await this.context7Service.getRelevantDocumentation('listMessages', JSON.stringify(options));
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'listMessages');
    }

    return await this.gmailService.listMessages(options);
  }

  /**
   * ✅ **Get message details with Context7 documentation**
   */
  async getMessage(messageId: string, format: 'full' | 'metadata' | 'minimal' = 'full'): Promise<GmailMessage> {
    const docs = await this.context7Service.getRelevantDocumentation('getMessage', `format: ${format}`);
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'getMessage');
    }

    return await this.gmailService.getMessage(messageId, format);
  }

  /**
   * ✅ **Send email with Context7 documentation**
   */
  async sendMessage(email: EmailComposition): Promise<GmailMessage> {
    const context = `${email.isHtml ? 'HTML' : 'text'} email${email.attachments ? ' with attachments' : ''}`;
    const docs = await this.context7Service.getRelevantDocumentation('sendMessage', context);
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'sendMessage');
    }

    return await this.gmailService.sendMessage(email);
  }

  /**
   * ✅ **Create draft with Context7 documentation**
   */
  async createDraft(email: EmailComposition): Promise<GmailDraft> {
    const docs = await this.context7Service.getRelevantDocumentation('createDraft');
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'createDraft');
    }

    return await this.gmailService.createDraft(email);
  }

  /**
   * ✅ **Update draft with Context7 documentation**
   */
  async updateDraft(draftId: string, email: EmailComposition): Promise<GmailDraft> {
    const docs = await this.context7Service.getRelevantDocumentation('updateDraft');
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'updateDraft');
    }

    return await this.gmailService.updateDraft(draftId, email);
  }

  /**
   * ✅ **Send draft with Context7 documentation**
   */
  async sendDraft(draftId: string): Promise<GmailMessage> {
    const docs = await this.context7Service.getRelevantDocumentation('sendDraft');
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'sendDraft');
    }

    return await this.gmailService.sendDraft(draftId);
  }

  /**
   * ✅ **List drafts with Context7 documentation**
   */
  async listDrafts(maxResults: number = 10, pageToken?: string) {
    const docs = await this.context7Service.getRelevantDocumentation('listDrafts');
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'listDrafts');
    }

    return await this.gmailService.listDrafts(maxResults, pageToken);
  }

  /**
   * ✅ **Perform batch operations with Context7 documentation**
   */
  async performBatchOperation(operation: BatchOperation): Promise<void> {
    const docs = await this.context7Service.getRelevantDocumentation('batchOperation', operation.action);
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'batchOperation');
    }

    return await this.gmailService.performBatchOperation(operation);
  }

  /**
   * ✅ **Get labels with Context7 documentation**
   */
  async getLabels(): Promise<ListLabelsResponse> {
    const docs = await this.context7Service.getRelevantDocumentation('getLabels');
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'getLabels');
    }

    return await this.gmailService.getLabels();
  }

  /**
   * ✅ **Get email statistics with Context7 documentation**
   */
  async getEmailStats(): Promise<EmailStats> {
    const docs = await this.context7Service.getRelevantDocumentation('getStats');
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'getStats');
    }

    return await this.gmailService.getEmailStats();
  }

  /**
   * ✅ **Get thread details with Context7 documentation**
   */
  async getThread(threadId: string, format: 'full' | 'metadata' | 'minimal' = 'full') {
    const docs = await this.context7Service.getRelevantDocumentation('getThread', `format: ${format}`);
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'getThread');
    }

    return await this.gmailService.getThread(threadId, format);
  }

  /**
   * ✅ **List threads with Context7 documentation**
   */
  async listThreads(options: EmailListOptions = {}) {
    const docs = await this.context7Service.getRelevantDocumentation('listThreads', JSON.stringify(options));
    if (docs) {
      this.context7Service.displayInTerminal(docs, 'listThreads');
    }

    return await this.gmailService.listThreads(options);
  }

  /**
   * ✅ **Logout and revoke tokens**
   */
  async logout(): Promise<void> {
    console.log('👋 Logging out...');
    await this.authService.logout();
  }

  /**
   * ✅ **Get authentication token info**
   */
  async getTokenInfo() {
    return await this.authService.getTokenInfo();
  }

  /**
   * ✅ **Context7 management methods**
   */
  enableContext7(): void {
    this.context7Service.setEnabled(true);
  }

  disableContext7(): void {
    this.context7Service.setEnabled(false);
  }

  clearContext7Cache(): void {
    this.context7Service.clearCache();
  }

  getContext7Stats() {
    return this.context7Service.getCacheStats();
  }

  /**
   * ✅ **Get documentation for specific operation (programmatic access)**
   */
  async getDocumentation(operation: string, context?: string): Promise<Context7Response | null> {
    return await this.context7Service.getRelevantDocumentation(operation, context);
  }

  /**
   * ✅ **Get documentation as code comments**
   */
  async getDocumentationAsComments(operation: string, context?: string): Promise<string> {
    const docs = await this.context7Service.getRelevantDocumentation(operation, context);
    return this.context7Service.getAsCodeComments(docs!);
  }
}

/**
 * ✅ **Factory function to create GmailMCPManager from environment variables**
 * **Usage**: Quick setup using .env file
 * **Security Alert**: Ensure .env file is not committed to version control
 */
export function createFromEnvironment(): GmailMCPManager {
  const config: GmailMCPConfig = {
    oauth2: {
      clientId: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
      redirectUri: process.env['GOOGLE_REDIRECT_URI'] || 'http://localhost:3000/oauth2callback',
      scopes: (process.env['GOOGLE_SCOPES'] || 'https://www.googleapis.com/auth/gmail.modify').split(','),
    },
    tokenStoragePath: process.env['TOKEN_STORAGE_PATH'] || undefined,
    defaultUserId: process.env['DEFAULT_USER_ID'] || 'me',
    context7Enabled: process.env['CONTEXT7_ENABLED'] !== 'false', // Default to true
  };

  if (!config.oauth2.clientId || !config.oauth2.clientSecret) {
    throw new Error(
      'Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
    );
  }

  return new GmailMCPManager(config);
}

/**
 * ✅ **Default export for convenience**
 */
export default GmailMCPManager;

/**
 * ✅ **Version information**
 */
export const VERSION = '1.3.3';
export const AUTHOR = 'MCP Gmail Manager';
export const LICENSE = 'MIT';

/**
 * ✅ **Common Gmail scopes for easy reference**
 */
export const GMAIL_SCOPES = {
  READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
  MODIFY: 'https://www.googleapis.com/auth/gmail.modify',
  COMPOSE: 'https://www.googleapis.com/auth/gmail.compose',
  SEND: 'https://www.googleapis.com/auth/gmail.send',
  LABELS: 'https://www.googleapis.com/auth/gmail.labels',
  SETTINGS_BASIC: 'https://www.googleapis.com/auth/gmail.settings.basic',
  SETTINGS_SHARING: 'https://www.googleapis.com/auth/gmail.settings.sharing',
} as const;