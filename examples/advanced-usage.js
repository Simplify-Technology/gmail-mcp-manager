#!/usr/bin/env node

/**
 * Gmail MCP Server - Advanced Usage Example
 * Demonstrates advanced features including Context7 integration, batch operations, and drafts
 */

import { GmailMCPManager, GMAIL_SCOPES } from '@cristiano-morgante/gmail-mcp-manager';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function advancedExample() {
  try {
    console.log('🚀 Gmail MCP Server - Advanced Usage Example');
    console.log('=============================================\n');

    // Method 2: Create with custom configuration
    const config = {
      oauth2: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/oauth2callback',
        scopes: [GMAIL_SCOPES.MODIFY, GMAIL_SCOPES.COMPOSE]
      },
      defaultUserId: 'me',
      context7Enabled: true, // Enable Context7 documentation
      tokenStoragePath: './tokens.json'
    };

    const manager = new GmailMCPManager(config);
    await manager.initialize();

    // Example 1: Context7 Integration - Get documentation for specific operations
    console.log('📚 Context7 Integration Example');
    console.log('================================');
    
    const sendDocs = await manager.getDocumentation('sendMessage', 'HTML email with attachments');
    if (sendDocs) {
      console.log('📖 Documentation retrieved for sendMessage operation');
      console.log('Examples:', sendDocs.examples.slice(0, 2));
    }

    // Example 2: Advanced Message Search
    console.log('\n🔍 Advanced Message Search');
    console.log('===========================');
    
    const searchQueries = [
      'is:unread from:important@company.com',
      'has:attachment subject:invoice',
      'is:starred newer_than:7d'
    ];

    for (const query of searchQueries) {
      const results = await manager.listMessages({
        query,
        maxResults: 3
      });
      console.log(`Query: "${query}" - Found: ${results.resultSizeEstimate} messages`);
    }

    // Example 3: Draft Management
    console.log('\n📝 Draft Management');
    console.log('===================');
    
    // Create a draft
    const draftEmail = {
      to: ['colleague@company.com'],
      cc: ['manager@company.com'],
      subject: 'Weekly Report - Draft',
      body: `
        <h2>Weekly Report</h2>
        <p>This is a draft of the weekly report.</p>
        <ul>
          <li>Task 1: Completed</li>
          <li>Task 2: In Progress</li>
          <li>Task 3: Pending</li>
        </ul>
        <p>Best regards,<br>Your Name</p>
      `,
      isHtml: true
    };

    // Uncomment to create actual draft
    // const draft = await manager.createDraft(draftEmail);
    // console.log('Draft created with ID:', draft.id);
    console.log('Draft composition ready (uncomment to create)');

    // List existing drafts
    const drafts = await manager.listDrafts(5);
    console.log(`Found ${drafts.resultSizeEstimate || 0} existing drafts`);

    // Example 4: Batch Operations
    console.log('\n📦 Batch Operations');
    console.log('===================');
    
    // Get some message IDs for batch operations (safely)
    const recentMessages = await manager.listMessages({
      query: 'is:read',
      maxResults: 3
    });

    if (recentMessages.messages && recentMessages.messages.length > 0) {
      const messageIds = recentMessages.messages.map(msg => msg.id);
      
      // Example batch operations (commented for safety)
      console.log(`Found ${messageIds.length} messages for batch operations`);
      
      // Batch mark as unread (uncomment to execute)
      // await manager.performBatchOperation({
      //   messageIds: messageIds,
      //   action: 'unread'
      // });
      
      // Batch archive (uncomment to execute)
      // await manager.performBatchOperation({
      //   messageIds: messageIds,
      //   action: 'archive'
      // });
      
      console.log('Batch operations ready (uncomment to execute)');
    }

    // Example 5: Thread Management
    console.log('\n🧵 Thread Management');
    console.log('====================');
    
    const threads = await manager.listThreads({
      maxResults: 3,
      query: 'is:important'
    });
    
    console.log(`Found ${threads.resultSizeEstimate} important threads`);
    
    if (threads.threads && threads.threads.length > 0) {
      const firstThread = threads.threads[0];
      const threadDetails = await manager.getThread(firstThread.id, 'metadata');
      console.log(`Thread ${firstThread.id} has ${threadDetails.messages?.length || 0} messages`);
    }

    // Example 6: Label Management
    console.log('\n🏷️ Label Management');
    console.log('===================');
    
    const labels = await manager.getLabels();
    const systemLabels = labels.labels?.filter(label => label.type === 'system') || [];
    const userLabels = labels.labels?.filter(label => label.type === 'user') || [];
    
    console.log(`System labels: ${systemLabels.length}`);
    console.log(`User labels: ${userLabels.length}`);
    
    // Show some interesting labels
    const interestingLabels = ['INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH'];
    interestingLabels.forEach(labelName => {
      const label = labels.labels?.find(l => l.name === labelName);
      if (label) {
        console.log(`${labelName}: ${label.messagesTotal || 0} total, ${label.messagesUnread || 0} unread`);
      }
    });

    // Example 7: Context7 Cache Management
    console.log('\n🗄️ Context7 Cache Management');
    console.log('=============================');
    
    const cacheStats = manager.getContext7Stats();
    console.log(`Cache size: ${cacheStats.size} entries`);
    console.log(`Cached operations: ${cacheStats.keys.join(', ') || 'None'}`);
    
    // Clear cache if needed
    if (cacheStats.size > 10) {
      manager.clearContext7Cache();
      console.log('Cache cleared due to size limit');
    }

    // Example 8: Email with Attachments (preparation only)
    console.log('\n📎 Email with Attachments');
    console.log('=========================');
    
    const emailWithAttachment = {
      to: ['recipient@example.com'],
      subject: 'Document Attached',
      body: 'Please find the attached document.',
      isHtml: false,
      attachments: [
        {
          filename: 'report.txt',
          content: 'This is a sample report content.',
          contentType: 'text/plain'
        }
      ]
    };
    
    console.log('Email with attachment prepared (uncomment sendMessage to send)');
    // const sentWithAttachment = await manager.sendMessage(emailWithAttachment);

    console.log('\n✅ Advanced example completed successfully!');
    console.log('\n💡 Tips:');
    console.log('- Uncomment the actual operations to test them');
    console.log('- Always test with non-important emails first');
    console.log('- Use Context7 documentation for detailed API information');
    console.log('- Check token permissions match your required scopes');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Enhanced error handling
    if (error.code === 'AUTHENTICATION_ERROR') {
      console.log('\n🔐 Authentication Help:');
      console.log('1. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set');
      console.log('2. Run: gmail-mcp auth login');
      console.log('3. Check your Google Cloud Console OAuth2 configuration');
    } else if (error.code === 'API_ERROR') {
      console.log('\n🔧 API Error Help:');
      console.log('1. Check your internet connection');
      console.log('2. Verify your OAuth2 scopes include required permissions');
      console.log('3. Check Gmail API quotas in Google Cloud Console');
    }
    
    process.exit(1);
  }
}

// Run the advanced example
advancedExample();