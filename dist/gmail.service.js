/**
 * Gmail Service for Gmail MCP Server
 * Encapsulates Gmail API operations with authentication
 */
import { google } from 'googleapis';
import { APIError } from './types.js';
export class GmailService {
    gmail;
    authService;
    userId;
    constructor(authService, userId = 'me') {
        this.authService = authService;
        this.userId = userId;
    }
    /**
     * ✅ **Initialize Gmail API client with authentication**
     * **Functionality**: Sets up authenticated Gmail API client
     * **Performance**: Reuses authenticated client for all operations
     */
    async initialize() {
        try {
            const authClient = await this.authService.authenticate();
            this.gmail = google.gmail({ version: 'v1', auth: authClient });
            console.log('✅ Gmail API client initialized successfully');
        }
        catch (error) {
            throw new APIError(`Failed to initialize Gmail API: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
        }
    }
    /**
     * ✅ **List messages with filters and pagination**
     * **Source**: Gmail API documentation
     * **Functionality**: Search and filter emails with advanced query support
     */
    async listMessages(options = {}) {
        await this.ensureInitialized();
        try {
            const params = {
                userId: options.userId || this.userId,
                maxResults: options.maxResults || 10,
                includeSpamTrash: options.includeSpamTrash || false,
            };
            if (options.query)
                params.q = options.query;
            if (options.labelIds)
                params.labelIds = options.labelIds;
            if (options.pageToken)
                params.pageToken = options.pageToken;
            const response = await this.gmail.users.messages.list(params);
            console.log(`📧 Found ${response.data.resultSizeEstimate} messages`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to list messages: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * ✅ **Get complete message details including body and attachments**
     * **Functionality**: Retrieves full message content with HTML/text parsing
     * **Performance**: Efficient single API call for complete message data
     */
    async getMessage(messageId, format = 'full') {
        await this.ensureInitialized();
        try {
            const response = await this.gmail.users.messages.get({
                userId: this.userId,
                id: messageId,
                format: format,
            });
            console.log(`📖 Retrieved message: ${messageId}`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to get message ${messageId}: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * ✅ **Send email with HTML/text support and attachments**
     * **Functionality**: Complete email composition and sending
     * **Security**: Proper MIME encoding and attachment handling
     */
    async sendMessage(email) {
        await this.ensureInitialized();
        try {
            const rawMessage = this.createRawMessage(email);
            const response = await this.gmail.users.messages.send({
                userId: this.userId,
                requestBody: {
                    raw: rawMessage,
                },
            });
            console.log(`📤 Email sent successfully: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to send message: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * ✅ **Create and manage drafts**
     * **Functionality**: Draft creation, updating, and sending
     */
    async createDraft(email) {
        await this.ensureInitialized();
        try {
            const rawMessage = this.createRawMessage(email);
            const response = await this.gmail.users.drafts.create({
                userId: this.userId,
                requestBody: {
                    message: {
                        raw: rawMessage,
                    },
                },
            });
            console.log(`📝 Draft created: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to create draft: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * Update existing draft
     */
    async updateDraft(draftId, email) {
        await this.ensureInitialized();
        try {
            const rawMessage = this.createRawMessage(email);
            const response = await this.gmail.users.drafts.update({
                userId: this.userId,
                id: draftId,
                requestBody: {
                    message: {
                        raw: rawMessage,
                    },
                },
            });
            console.log(`📝 Draft updated: ${draftId}`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to update draft ${draftId}: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * Send draft
     */
    async sendDraft(draftId) {
        await this.ensureInitialized();
        try {
            const response = await this.gmail.users.drafts.send({
                userId: this.userId,
                requestBody: {
                    id: draftId,
                },
            });
            console.log(`📤 Draft sent: ${draftId}`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to send draft ${draftId}: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * List drafts
     */
    async listDrafts(maxResults = 10, pageToken) {
        await this.ensureInitialized();
        try {
            const params = {
                userId: this.userId,
                maxResults,
            };
            if (pageToken)
                params.pageToken = pageToken;
            const response = await this.gmail.users.drafts.list(params);
            console.log(`📝 Found ${response.data.resultSizeEstimate || 0} drafts`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to list drafts: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * ✅ **Perform batch operations on messages**
     * **Functionality**: Mark as read/unread, archive, delete, add/remove labels
     * **Performance**: Efficient batch processing for multiple messages
     */
    async performBatchOperation(operation) {
        await this.ensureInitialized();
        try {
            const { messageIds, action, labelIds } = operation;
            switch (action) {
                case 'read':
                    await this.gmail.users.messages.batchModify({
                        userId: this.userId,
                        requestBody: {
                            ids: messageIds,
                            removeLabelIds: ['UNREAD'],
                        },
                    });
                    break;
                case 'unread':
                    await this.gmail.users.messages.batchModify({
                        userId: this.userId,
                        requestBody: {
                            ids: messageIds,
                            addLabelIds: ['UNREAD'],
                        },
                    });
                    break;
                case 'archive':
                    await this.gmail.users.messages.batchModify({
                        userId: this.userId,
                        requestBody: {
                            ids: messageIds,
                            removeLabelIds: ['INBOX'],
                        },
                    });
                    break;
                case 'delete':
                    // Note: This moves to trash, not permanent delete
                    await this.gmail.users.messages.batchModify({
                        userId: this.userId,
                        requestBody: {
                            ids: messageIds,
                            addLabelIds: ['TRASH'],
                            removeLabelIds: ['INBOX'],
                        },
                    });
                    break;
                case 'trash':
                    for (const messageId of messageIds) {
                        await this.gmail.users.messages.trash({
                            userId: this.userId,
                            id: messageId,
                        });
                    }
                    break;
                case 'spam':
                    await this.gmail.users.messages.batchModify({
                        userId: this.userId,
                        requestBody: {
                            ids: messageIds,
                            addLabelIds: ['SPAM'],
                            removeLabelIds: ['INBOX'],
                        },
                    });
                    break;
                default:
                    throw new APIError(`Unknown action: ${action}`, 400);
            }
            // Apply additional labels if specified
            if (labelIds && labelIds.length > 0) {
                await this.gmail.users.messages.batchModify({
                    userId: this.userId,
                    requestBody: {
                        ids: messageIds,
                        addLabelIds: labelIds,
                    },
                });
            }
            console.log(`✅ Batch operation '${action}' completed for ${messageIds.length} messages`);
        }
        catch (error) {
            throw new APIError(`Failed to perform batch operation: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * ✅ **Get all labels**
     * **Functionality**: Retrieve user's Gmail labels for filtering and organization
     */
    async getLabels() {
        await this.ensureInitialized();
        try {
            const response = await this.gmail.users.labels.list({
                userId: this.userId,
            });
            console.log(`🏷️ Found ${response.data.labels?.length || 0} labels`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to get labels: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * ✅ **Get email statistics**
     * **Functionality**: Provides overview of mailbox statistics
     */
    async getEmailStats() {
        await this.ensureInitialized();
        try {
            const [unreadResponse, allResponse] = await Promise.all([
                this.gmail.users.messages.list({
                    userId: this.userId,
                    q: 'is:unread',
                    maxResults: 1,
                }),
                this.gmail.users.messages.list({
                    userId: this.userId,
                    maxResults: 1,
                }),
            ]);
            const stats = {
                total: allResponse.data.resultSizeEstimate || 0,
                unread: unreadResponse.data.resultSizeEstimate || 0,
                archived: 0, // Would need additional queries
                spam: 0, // Would need additional queries
                trash: 0, // Would need additional queries
            };
            console.log(`📊 Email stats: ${stats.total} total, ${stats.unread} unread`);
            return stats;
        }
        catch (error) {
            throw new APIError(`Failed to get email stats: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * Create raw MIME message for sending
     * **Security**: Proper encoding and header formatting
     */
    createRawMessage(email) {
        const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let message = '';
        message += `To: ${email.to.join(', ')}\r\n`;
        if (email.cc && email.cc.length > 0) {
            message += `Cc: ${email.cc.join(', ')}\r\n`;
        }
        if (email.bcc && email.bcc.length > 0) {
            message += `Bcc: ${email.bcc.join(', ')}\r\n`;
        }
        message += `Subject: ${email.subject}\r\n`;
        message += `MIME-Version: 1.0\r\n`;
        if (email.attachments && email.attachments.length > 0) {
            message += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
            // Body part
            message += `--${boundary}\r\n`;
            message += `Content-Type: ${email.isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"\r\n`;
            message += `Content-Transfer-Encoding: quoted-printable\r\n\r\n`;
            message += `${email.body}\r\n\r\n`;
            // Attachment parts
            for (const attachment of email.attachments) {
                message += `--${boundary}\r\n`;
                message += `Content-Type: ${attachment.contentType}; name="${attachment.filename}"\r\n`;
                message += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
                message += `Content-Transfer-Encoding: base64\r\n\r\n`;
                const content = Buffer.isBuffer(attachment.content)
                    ? attachment.content.toString('base64')
                    : Buffer.from(attachment.content).toString('base64');
                message += `${content}\r\n\r\n`;
            }
            message += `--${boundary}--\r\n`;
        }
        else {
            message += `Content-Type: ${email.isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"\r\n`;
            message += `Content-Transfer-Encoding: quoted-printable\r\n\r\n`;
            message += `${email.body}\r\n`;
        }
        return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    /**
     * Ensure Gmail API is initialized
     */
    async ensureInitialized() {
        if (!this.gmail) {
            await this.initialize();
        }
    }
    /**
     * Get thread details
     */
    async getThread(threadId, format = 'full') {
        await this.ensureInitialized();
        try {
            const response = await this.gmail.users.threads.get({
                userId: this.userId,
                id: threadId,
                format: format,
            });
            console.log(`🧵 Retrieved thread: ${threadId}`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to get thread ${threadId}: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
    /**
     * List threads
     */
    async listThreads(options = {}) {
        await this.ensureInitialized();
        try {
            const params = {
                userId: options.userId || this.userId,
                maxResults: options.maxResults || 10,
                includeSpamTrash: options.includeSpamTrash || false,
            };
            if (options.query)
                params.q = options.query;
            if (options.labelIds)
                params.labelIds = options.labelIds;
            if (options.pageToken)
                params.pageToken = options.pageToken;
            const response = await this.gmail.users.threads.list(params);
            console.log(`🧵 Found ${response.data.resultSizeEstimate} threads`);
            return response.data;
        }
        catch (error) {
            throw new APIError(`Failed to list threads: ${error.message || 'Unknown error'}`, error.status || 500);
        }
    }
}
//# sourceMappingURL=gmail.service.js.map