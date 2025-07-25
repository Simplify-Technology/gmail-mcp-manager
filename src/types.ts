/**
 * Types and interfaces for Gmail MCP Server
 */

// OAuth2 Configuration
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

// Token storage
export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

// Gmail API Types
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: MessagePayload;
  sizeEstimate: number;
  raw?: string;
}

export interface MessagePayload {
  partId?: string;
  mimeType: string;
  filename?: string;
  headers: MessageHeader[];
  body: MessageBody;
  parts?: MessagePayload[];
}

export interface MessageHeader {
  name: string;
  value: string;
}

export interface MessageBody {
  attachmentId?: string;
  size: number;
  data?: string;
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility: string;
  labelListVisibility: string;
  type: string;
  messagesTotal?: number;
  messagesUnread?: number;
  threadsTotal?: number;
  threadsUnread?: number;
  color?: {
    textColor: string;
    backgroundColor: string;
  };
}

export interface GmailDraft {
  id: string;
  message: GmailMessage;
}

// Email composition
export interface EmailComposition {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  encoding?: string;
}

// Search and filter options
export interface EmailSearchOptions {
  query?: string;
  labelIds?: string[];
  maxResults?: number;
  pageToken?: string;
  includeSpamTrash?: boolean;
}

export interface EmailListOptions extends EmailSearchOptions {
  userId?: string;
}

// API Response types
export interface ListMessagesResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface ListThreadsResponse {
  threads: Array<{ id: string; historyId: string; snippet: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface ListLabelsResponse {
  labels: GmailLabel[];
}

export interface ListDraftsResponse {
  drafts: Array<{ id: string; message: { id: string; threadId: string } }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

// Context7 integration
export interface Context7Response {
  documentation: string;
  examples: string[];
  relevantLinks: string[];
}

// Configuration
export interface GmailMCPConfig {
  oauth2: OAuth2Config;
  tokenStoragePath?: string | undefined;
  defaultUserId?: string;
  context7Enabled?: boolean;
}

// CLI Command types
export interface CLIOptions {
  config?: string;
  verbose?: boolean;
  output?: 'json' | 'table' | 'csv';
}

// Error types
export class GmailMCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GmailMCPError';
  }
}

export class AuthenticationError extends GmailMCPError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class APIError extends GmailMCPError {
  constructor(message: string, statusCode: number) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'APIError';
  }
}

// Utility types
export type EmailAction = 'read' | 'unread' | 'archive' | 'delete' | 'trash' | 'spam';

export interface BatchOperation {
  messageIds: string[];
  action: EmailAction;
  labelIds?: string[];
}

export interface EmailStats {
  total: number;
  unread: number;
  archived: number;
  spam: number;
  trash: number;
}