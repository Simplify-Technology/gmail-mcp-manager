/**
 * Gmail Service for Gmail MCP Server
 * Encapsulates Gmail API operations with authentication
 */
import type { GmailMessage, GmailThread, GmailDraft, EmailComposition, EmailListOptions, ListMessagesResponse, ListThreadsResponse, ListLabelsResponse, ListDraftsResponse, BatchOperation, EmailStats } from './types.js';
import { AuthService } from './auth.service.js';
export declare class GmailService {
    private gmail;
    private authService;
    private userId;
    constructor(authService: AuthService, userId?: string);
    /**
     * ✅ **Initialize Gmail API client with authentication**
     * **Functionality**: Sets up authenticated Gmail API client
     * **Performance**: Reuses authenticated client for all operations
     */
    initialize(): Promise<void>;
    /**
     * ✅ **List messages with filters and pagination**
     * **Source**: Gmail API documentation
     * **Functionality**: Search and filter emails with advanced query support
     */
    listMessages(options?: EmailListOptions): Promise<ListMessagesResponse>;
    /**
     * ✅ **Get complete message details including body and attachments**
     * **Functionality**: Retrieves full message content with HTML/text parsing
     * **Performance**: Efficient single API call for complete message data
     */
    getMessage(messageId: string, format?: 'full' | 'metadata' | 'minimal'): Promise<GmailMessage>;
    /**
     * ✅ **Send email with HTML/text support and attachments**
     * **Functionality**: Complete email composition and sending
     * **Security**: Proper MIME encoding and attachment handling
     */
    sendMessage(email: EmailComposition): Promise<GmailMessage>;
    /**
     * ✅ **Create and manage drafts**
     * **Functionality**: Draft creation, updating, and sending
     */
    createDraft(email: EmailComposition): Promise<GmailDraft>;
    /**
     * Update existing draft
     */
    updateDraft(draftId: string, email: EmailComposition): Promise<GmailDraft>;
    /**
     * Send draft
     */
    sendDraft(draftId: string): Promise<GmailMessage>;
    /**
     * List drafts
     */
    listDrafts(maxResults?: number, pageToken?: string): Promise<ListDraftsResponse>;
    /**
     * ✅ **Perform batch operations on messages**
     * **Functionality**: Mark as read/unread, archive, delete, add/remove labels
     * **Performance**: Efficient batch processing for multiple messages
     */
    performBatchOperation(operation: BatchOperation): Promise<void>;
    /**
     * ✅ **Get all labels**
     * **Functionality**: Retrieve user's Gmail labels for filtering and organization
     */
    getLabels(): Promise<ListLabelsResponse>;
    /**
     * ✅ **Get email statistics**
     * **Functionality**: Provides overview of mailbox statistics
     */
    getEmailStats(): Promise<EmailStats>;
    /**
     * Create raw MIME message for sending
     * **Security**: Proper encoding and header formatting
     */
    private createRawMessage;
    /**
     * Ensure Gmail API is initialized
     */
    private ensureInitialized;
    /**
     * Get thread details
     */
    getThread(threadId: string, format?: 'full' | 'metadata' | 'minimal'): Promise<GmailThread>;
    /**
     * List threads
     */
    listThreads(options?: EmailListOptions): Promise<ListThreadsResponse>;
}
//# sourceMappingURL=gmail.service.d.ts.map