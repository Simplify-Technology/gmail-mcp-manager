#!/usr/bin/env node

/**
 * Gmail MCP Server - Basic Usage Example
 * Demonstrates how to use the Gmail MCP Manager programmatically
 */

import { GmailMCPManager, createFromEnvironment } from '@mcp/gmail-manager';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function basicExample() {
  try {
    console.log('🚀 Gmail MCP Server - Basic Usage Example');
    console.log('==========================================\n');

    // Method 1: Create from environment variables
    const manager = createFromEnvironment();

    // Initialize the manager (this will handle authentication)
    await manager.initialize();

    // Example 1: Get email statistics
    console.log('📊 Getting email statistics...');
    const stats = await manager.getEmailStats();
    console.log('Stats:', stats);

    // Example 2: List recent messages
    console.log('\n📧 Listing recent messages...');
    const messages = await manager.listMessages({
      maxResults: 5,
      query: 'is:unread'
    });
    console.log(`Found ${messages.resultSizeEstimate} unread messages`);

    // Example 3: Get labels
    console.log('\n🏷️ Getting labels...');
    const labels = await manager.getLabels();
    console.log(`Found ${labels.labels?.length || 0} labels`);

    // Example 4: Send a simple email
    console.log('\n📤 Sending test email...');
    const testEmail = {
      to: ['test@example.com'],
      subject: 'Test from Gmail MCP Server',
      body: 'This is a test email sent using Gmail MCP Server!',
      isHtml: false
    };

    // Uncomment to actually send (be careful!)
    // const sentMessage = await manager.sendMessage(testEmail);
    // console.log('Email sent with ID:', sentMessage.id);
    console.log('Email composition ready (uncomment to send)');

    console.log('\n✅ Basic example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
basicExample();