#!/usr/bin/env node

/**
 * Gmail MCP Server - MCP Protocol Implementation
 * Implements the Model Context Protocol for Gmail operations
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createFromEnvironment } from './index.js';
import type {
  EmailComposition,
  EmailListOptions,
  BatchOperation
} from './types.js';

// Initialize Gmail manager
let gmailManager: any = null;

async function initializeGmailManager() {
  if (!gmailManager) {
    gmailManager = createFromEnvironment();
    await gmailManager.initialize();
  }
  return gmailManager;
}

// Create MCP Server
const server = new McpServer({
  name: "gmail-mcp-server",
  version: "1.3.3"
});

/**
 * ✅ **Tool: List Messages**
 * **Functionality**: List Gmail messages with optional filtering
 */
server.registerTool(
  "list_messages",
  {
    title: "List Gmail Messages",
    description: "List Gmail messages with optional search query and filters",
    inputSchema: {
      query: z.string().optional().describe("Search query (e.g., 'is:unread', 'from:example@gmail.com')"),
      maxResults: z.number().min(1).max(100).default(10).describe("Maximum number of results to return"),
      labelIds: z.array(z.string()).optional().describe("Array of label IDs to filter by"),
      includeSpamTrash: z.boolean().default(false).describe("Include spam and trash in results")
    }
  },
  async ({ query, maxResults, labelIds, includeSpamTrash }) => {
    try {
      const manager = await initializeGmailManager();

      const options: EmailListOptions = {
        maxResults,
        includeSpamTrash,
        ...(query && { query }),
        ...(labelIds && { labelIds })
      };

      const result = await manager.listMessages(options);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: result,
            summary: `Found ${result.resultSizeEstimate} messages`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'LIST_MESSAGES_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Tool: Get Message**
 * **Functionality**: Get detailed information about a specific message
 */
server.registerTool(
  "get_message",
  {
    title: "Get Gmail Message",
    description: "Get detailed information about a specific Gmail message",
    inputSchema: {
      messageId: z.string().describe("The ID of the message to retrieve"),
      format: z.enum(["full", "metadata", "minimal"]).default("full").describe("Level of detail to return")
    }
  },
  async ({ messageId, format }) => {
    try {
      const manager = await initializeGmailManager();
      const message = await manager.getMessage(messageId, format);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: message,
            summary: `Retrieved message ${messageId}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'GET_MESSAGE_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Tool: Send Message**
 * **Functionality**: Send a new email message
 */
server.registerTool(
  "send_message",
  {
    title: "Send Gmail Message",
    description: "Send a new email message via Gmail",
    inputSchema: {
      to: z.array(z.string().email()).describe("Array of recipient email addresses"),
      cc: z.array(z.string().email()).optional().describe("Array of CC email addresses"),
      bcc: z.array(z.string().email()).optional().describe("Array of BCC email addresses"),
      subject: z.string().describe("Email subject line"),
      body: z.string().describe("Email body content"),
      isHtml: z.boolean().default(false).describe("Whether the body is HTML formatted")
    }
  },
  async ({ to, cc, bcc, subject, body, isHtml }) => {
    try {
      const manager = await initializeGmailManager();

      const email: EmailComposition = {
        to,
        subject,
        body,
        isHtml,
        ...(cc && { cc }),
        ...(bcc && { bcc })
      };

      const sentMessage = await manager.sendMessage(email);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: {
              messageId: sentMessage.id,
              threadId: sentMessage.threadId
            },
            summary: `Email sent successfully to ${to.join(', ')}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'SEND_MESSAGE_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Tool: Get Email Stats**
 * **Functionality**: Get statistics about the Gmail account
 */
server.registerTool(
  "get_email_stats",
  {
    title: "Get Email Statistics",
    description: "Get statistics about the Gmail account (total, unread, etc.)",
    inputSchema: {}
  },
  async () => {
    try {
      const manager = await initializeGmailManager();
      const stats = await manager.getEmailStats();

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: stats,
            summary: `Total: ${stats.total}, Unread: ${stats.unread}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'GET_STATS_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Tool: Get Labels**
 * **Functionality**: Get all Gmail labels/folders
 */
server.registerTool(
  "get_labels",
  {
    title: "Get Gmail Labels",
    description: "Get all Gmail labels and folders",
    inputSchema: {}
  },
  async () => {
    try {
      const manager = await initializeGmailManager();
      const labels = await manager.getLabels();

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: labels,
            summary: `Found ${labels.labels?.length || 0} labels`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'GET_LABELS_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Tool: Create Draft**
 * **Functionality**: Create a new email draft
 */
server.registerTool(
  "create_draft",
  {
    title: "Create Gmail Draft",
    description: "Create a new email draft",
    inputSchema: {
      to: z.array(z.string().email()).describe("Array of recipient email addresses"),
      cc: z.array(z.string().email()).optional().describe("Array of CC email addresses"),
      bcc: z.array(z.string().email()).optional().describe("Array of BCC email addresses"),
      subject: z.string().describe("Email subject line"),
      body: z.string().describe("Email body content"),
      isHtml: z.boolean().default(false).describe("Whether the body is HTML formatted")
    }
  },
  async ({ to, cc, bcc, subject, body, isHtml }) => {
    try {
      const manager = await initializeGmailManager();

      const email: EmailComposition = {
        to,
        subject,
        body,
        isHtml,
        ...(cc && { cc }),
        ...(bcc && { bcc })
      };

      const draft = await manager.createDraft(email);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: {
              draftId: draft.id,
              messageId: draft.message.id
            },
            summary: `Draft created successfully`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'CREATE_DRAFT_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Tool: Batch Operation**
 * **Functionality**: Perform batch operations on multiple messages
 */
server.registerTool(
  "batch_operation",
  {
    title: "Gmail Batch Operation",
    description: "Perform batch operations on multiple Gmail messages",
    inputSchema: {
      messageIds: z.array(z.string()).describe("Array of message IDs to operate on"),
      action: z.enum(["read", "unread", "archive", "delete", "trash", "spam"]).describe("Action to perform"),
      labelIds: z.array(z.string()).optional().describe("Label IDs for label operations")
    }
  },
  async ({ messageIds, action, labelIds }) => {
    try {
      const manager = await initializeGmailManager();

      const operation: BatchOperation = {
        messageIds,
        action,
        ...(labelIds && { labelIds })
      };

      await manager.performBatchOperation(operation);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: {
              processedCount: messageIds.length,
              action,
              messageIds
            },
            summary: `Batch ${action} operation completed on ${messageIds.length} messages`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'BATCH_OPERATION_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Tool: Search Messages**
 * **Functionality**: Advanced search for Gmail messages
 */
server.registerTool(
  "search_messages",
  {
    title: "Search Gmail Messages",
    description: "Advanced search for Gmail messages with complex queries",
    inputSchema: {
      query: z.string().describe("Advanced search query (Gmail search syntax)"),
      maxResults: z.number().min(1).max(100).default(20).describe("Maximum number of results"),
      includeSpamTrash: z.boolean().default(false).describe("Include spam and trash in search")
    }
  },
  async ({ query, maxResults, includeSpamTrash }) => {
    try {
      const manager = await initializeGmailManager();

      const options: EmailListOptions = {
        query,
        maxResults,
        includeSpamTrash
      };

      const result = await manager.listMessages(options);

      // Get detailed info for first few messages
      const detailedMessages = [];
      const messagesToDetail = Math.min(5, result.messages?.length || 0);

      for (let i = 0; i < messagesToDetail; i++) {
        if (result.messages && result.messages[i]) {
          try {
            const message = await manager.getMessage(result.messages[i].id, 'metadata');
            detailedMessages.push(message);
          } catch (err) {
            // Skip messages that can't be retrieved
          }
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: {
              totalFound: result.resultSizeEstimate,
              messages: result.messages,
              detailedSample: detailedMessages,
              query
            },
            summary: `Search found ${result.resultSizeEstimate} messages for query: "${query}"`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'SEARCH_MESSAGES_ERROR'
          }, null, 2)
        }]
      };
    }
  }
);

/**
 * ✅ **Main Function: Start MCP Server**
 */
async function main() {
  try {
    console.error("🚀 Starting Gmail MCP Server...");

    // Initialize Gmail manager to check authentication
    await initializeGmailManager();
    console.error("✅ Gmail authentication successful");

    // Start MCP server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("📡 Gmail MCP Server connected and ready");
  } catch (error) {
    console.error("❌ Failed to start Gmail MCP Server:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error("🛑 Shutting down Gmail MCP Server...");
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error("🛑 Shutting down Gmail MCP Server...");
  process.exit(0);
});

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { server, main };