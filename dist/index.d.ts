/**
 * Gmail MCP Server - Main Module
 * Complete MCP Server for Gmail API management with OAuth2 authentication and Context7 integration
 *
 * @author MCP Gmail Manager
 * @version 1.0.0
 * @license MIT
 */
export type { OAuth2Config, TokenData, GmailMessage, MessagePayload, MessageHeader, MessageBody, GmailThread, GmailLabel, GmailDraft, EmailComposition, EmailAttachment, EmailSearchOptions, EmailListOptions, ListMessagesResponse, ListThreadsResponse, ListLabelsResponse, ListDraftsResponse, Context7Response, GmailMCPConfig, CLIOptions, EmailAction, BatchOperation, EmailStats, } from './types.js';
export { GmailMCPError, AuthenticationError, APIError, } from './types.js';
export { AuthService } from './auth.service.js';
export { GmailService } from './gmail.service.js';
export { Context7Service } from './context7.js';
import type { GmailMCPConfig, EmailComposition, EmailListOptions, BatchOperation, GmailMessage, GmailDraft, ListMessagesResponse, ListLabelsResponse, EmailStats, Context7Response } from './types.js';
/**
 * ✅ **Main Gmail MCP Manager Class**
 * **Functionality**: Unified interface for all Gmail operations with Context7 integration
 * **Usage**: Can be used as importable module or via CLI
 * **Security**: Implements secure OAuth2 authentication with token persistence
 */
export declare class GmailMCPManager {
    private authService;
    private gmailService;
    private context7Service;
    constructor(config: GmailMCPConfig);
    /**
     * ✅ **Initialize the Gmail MCP Manager**
     * **Functionality**: Sets up authentication and Gmail API client
     */
    initialize(): Promise<void>;
    /**
     * ✅ **List messages with Context7 documentation**
     * **Functionality**: List emails with automatic documentation display
     */
    listMessages(options?: EmailListOptions): Promise<ListMessagesResponse>;
    /**
     * ✅ **Get message details with Context7 documentation**
     */
    getMessage(messageId: string, format?: 'full' | 'metadata' | 'minimal'): Promise<GmailMessage>;
    /**
     * ✅ **Send email with Context7 documentation**
     */
    sendMessage(email: EmailComposition): Promise<GmailMessage>;
    /**
     * ✅ **Create draft with Context7 documentation**
     */
    createDraft(email: EmailComposition): Promise<GmailDraft>;
    /**
     * ✅ **Update draft with Context7 documentation**
     */
    updateDraft(draftId: string, email: EmailComposition): Promise<GmailDraft>;
    /**
     * ✅ **Send draft with Context7 documentation**
     */
    sendDraft(draftId: string): Promise<GmailMessage>;
    /**
     * ✅ **List drafts with Context7 documentation**
     */
    listDrafts(maxResults?: number, pageToken?: string): Promise<import("./types.js").ListDraftsResponse>;
    /**
     * ✅ **Perform batch operations with Context7 documentation**
     */
    performBatchOperation(operation: BatchOperation): Promise<void>;
    /**
     * ✅ **Get labels with Context7 documentation**
     */
    getLabels(): Promise<ListLabelsResponse>;
    /**
     * ✅ **Get email statistics with Context7 documentation**
     */
    getEmailStats(): Promise<EmailStats>;
    /**
     * ✅ **Get thread details with Context7 documentation**
     */
    getThread(threadId: string, format?: 'full' | 'metadata' | 'minimal'): Promise<import("./types.js").GmailThread>;
    /**
     * ✅ **List threads with Context7 documentation**
     */
    listThreads(options?: EmailListOptions): Promise<import("./types.js").ListThreadsResponse>;
    /**
     * ✅ **Logout and revoke tokens**
     */
    logout(): Promise<void>;
    /**
     * ✅ **Get authentication token info**
     */
    getTokenInfo(): Promise<any>;
    /**
     * ✅ **Context7 management methods**
     */
    enableContext7(): void;
    disableContext7(): void;
    clearContext7Cache(): void;
    getContext7Stats(): {
        size: number;
        keys: string[];
    };
    /**
     * ✅ **Get documentation for specific operation (programmatic access)**
     */
    getDocumentation(operation: string, context?: string): Promise<Context7Response | null>;
    /**
     * ✅ **Get documentation as code comments**
     */
    getDocumentationAsComments(operation: string, context?: string): Promise<string>;
}
/**
 * ✅ **Factory function to create GmailMCPManager from environment variables**
 * **Usage**: Quick setup using .env file
 * **Security Alert**: Ensure .env file is not committed to version control
 */
export declare function createFromEnvironment(): GmailMCPManager;
/**
 * ✅ **Default export for convenience**
 */
export default GmailMCPManager;
/**
 * ✅ **Version information**
 */
export declare const VERSION = "1.0.0";
export declare const AUTHOR = "MCP Gmail Manager";
export declare const LICENSE = "MIT";
/**
 * ✅ **Common Gmail scopes for easy reference**
 */
export declare const GMAIL_SCOPES: {
    readonly READONLY: "https://www.googleapis.com/auth/gmail.readonly";
    readonly MODIFY: "https://www.googleapis.com/auth/gmail.modify";
    readonly COMPOSE: "https://www.googleapis.com/auth/gmail.compose";
    readonly SEND: "https://www.googleapis.com/auth/gmail.send";
    readonly LABELS: "https://www.googleapis.com/auth/gmail.labels";
    readonly SETTINGS_BASIC: "https://www.googleapis.com/auth/gmail.settings.basic";
    readonly SETTINGS_SHARING: "https://www.googleapis.com/auth/gmail.settings.sharing";
};
//# sourceMappingURL=index.d.ts.map