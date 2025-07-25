#!/usr/bin/env node
/**
 * Gmail MCP Server - CLI Interface
 * Command-line interface for Gmail MCP Server operations
 */
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createFromEnvironment, VERSION } from './index.js';
const program = new Command();
// Global manager instance
let manager;
/**
 * ✅ **Initialize CLI with global options**
 * **Functionality**: Sets up commander with global configuration
 */
program
    .name('gmail-mcp')
    .description('Gmail MCP Server - Manage Gmail via command line with Context7 integration')
    .version(VERSION)
    .option('-v, --verbose', 'Enable verbose logging')
    .option('--no-context7', 'Disable Context7 documentation integration')
    .hook('preAction', async (thisCommand) => {
    try {
        console.log(chalk.blue.bold('🚀 Gmail MCP Server CLI'));
        console.log(chalk.gray(`Version: ${VERSION}\n`));
        // Initialize manager
        manager = createFromEnvironment();
        // Disable Context7 if requested
        if (!thisCommand.opts()['context7']) {
            manager.disableContext7();
            console.log(chalk.yellow('📚 Context7 integration disabled\n'));
        }
        await manager.initialize();
    }
    catch (error) {
        console.error(chalk.red('❌ Initialization failed:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
/**
 * ✅ **Authentication Commands**
 */
const authCommand = program
    .command('auth')
    .description('Authentication management');
authCommand
    .command('login')
    .description('Authenticate with Google OAuth2')
    .action(async () => {
    try {
        console.log(chalk.blue('🔐 Starting authentication...'));
        await manager.initialize(); // This will trigger auth if needed
        console.log(chalk.green('✅ Authentication successful!'));
    }
    catch (error) {
        console.error(chalk.red('❌ Authentication failed:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
authCommand
    .command('logout')
    .description('Logout and revoke tokens')
    .action(async () => {
    try {
        await manager.logout();
        console.log(chalk.green('✅ Logged out successfully!'));
    }
    catch (error) {
        console.error(chalk.red('❌ Logout failed:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
authCommand
    .command('status')
    .description('Show authentication status')
    .action(async () => {
    try {
        const tokenInfo = await manager.getTokenInfo();
        console.log(chalk.green('✅ Authentication Status:'));
        console.log(chalk.gray('Token Info:'), JSON.stringify(tokenInfo, null, 2));
    }
    catch (error) {
        console.error(chalk.red('❌ Not authenticated or token invalid'));
        console.log(chalk.yellow('💡 Run "gmail-mcp auth login" to authenticate'));
    }
});
/**
 * ✅ **Message Commands**
 */
const messageCommand = program
    .command('messages')
    .alias('msg')
    .description('Message management');
messageCommand
    .command('list')
    .description('List messages')
    .option('-q, --query <query>', 'Search query (e.g., "is:unread")')
    .option('-l, --labels <labels>', 'Comma-separated label IDs')
    .option('-m, --max <number>', 'Maximum results', '10')
    .option('--include-spam-trash', 'Include spam and trash')
    .action(async (options) => {
    try {
        const listOptions = {
            query: options.query,
            maxResults: parseInt(options.max),
            includeSpamTrash: options.includeSpamTrash,
        };
        if (options.labels) {
            listOptions.labelIds = options.labels.split(',');
        }
        const response = await manager.listMessages(listOptions);
        console.log(chalk.green(`📧 Found ${response.resultSizeEstimate} messages:`));
        if (response.messages && response.messages.length > 0) {
            response.messages.forEach((msg, index) => {
                console.log(chalk.gray(`${index + 1}. ID: ${msg.id} | Thread: ${msg.threadId}`));
            });
        }
        else {
            console.log(chalk.yellow('No messages found'));
        }
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to list messages:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
messageCommand
    .command('get <messageId>')
    .description('Get message details')
    .option('-f, --format <format>', 'Message format (full|metadata|minimal)', 'full')
    .action(async (messageId, options) => {
    try {
        const message = await manager.getMessage(messageId, options.format);
        console.log(chalk.green('📖 Message Details:'));
        console.log(chalk.gray('ID:'), message.id);
        console.log(chalk.gray('Thread ID:'), message.threadId);
        console.log(chalk.gray('Snippet:'), message.snippet);
        if (message.payload && message.payload.headers) {
            const headers = message.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown sender';
            const date = headers.find(h => h.name === 'Date')?.value || 'Unknown date';
            console.log(chalk.gray('Subject:'), subject);
            console.log(chalk.gray('From:'), from);
            console.log(chalk.gray('Date:'), date);
        }
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to get message:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
messageCommand
    .command('send')
    .description('Send an email')
    .action(async () => {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'to',
                message: 'To (comma-separated):',
                validate: (input) => input.trim() !== '' || 'Recipients are required',
            },
            {
                type: 'input',
                name: 'cc',
                message: 'CC (optional, comma-separated):',
            },
            {
                type: 'input',
                name: 'subject',
                message: 'Subject:',
                validate: (input) => input.trim() !== '' || 'Subject is required',
            },
            {
                type: 'confirm',
                name: 'isHtml',
                message: 'Send as HTML?',
                default: false,
            },
            {
                type: 'editor',
                name: 'body',
                message: 'Email body:',
                validate: (input) => input.trim() !== '' || 'Body is required',
            },
        ]);
        const email = {
            to: answers.to.split(',').map((email) => email.trim()),
            subject: answers.subject,
            body: answers.body,
            isHtml: answers.isHtml,
        };
        if (answers.cc && answers.cc.trim()) {
            email.cc = answers.cc.split(',').map((email) => email.trim());
        }
        const sentMessage = await manager.sendMessage(email);
        console.log(chalk.green('✅ Email sent successfully!'));
        console.log(chalk.gray('Message ID:'), sentMessage.id);
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to send email:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
/**
 * ✅ **Draft Commands**
 */
const draftCommand = program
    .command('drafts')
    .description('Draft management');
draftCommand
    .command('list')
    .description('List drafts')
    .option('-m, --max <number>', 'Maximum results', '10')
    .action(async (options) => {
    try {
        const response = await manager.listDrafts(parseInt(options.max));
        console.log(chalk.green(`📝 Found ${response.resultSizeEstimate || 0} drafts:`));
        if (response.drafts && response.drafts.length > 0) {
            response.drafts.forEach((draft, index) => {
                console.log(chalk.gray(`${index + 1}. ID: ${draft.id} | Message ID: ${draft.message.id}`));
            });
        }
        else {
            console.log(chalk.yellow('No drafts found'));
        }
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to list drafts:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
draftCommand
    .command('create')
    .description('Create a new draft')
    .action(async () => {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'to',
                message: 'To (comma-separated):',
                validate: (input) => input.trim() !== '' || 'Recipients are required',
            },
            {
                type: 'input',
                name: 'subject',
                message: 'Subject:',
                validate: (input) => input.trim() !== '' || 'Subject is required',
            },
            {
                type: 'confirm',
                name: 'isHtml',
                message: 'Use HTML format?',
                default: false,
            },
            {
                type: 'editor',
                name: 'body',
                message: 'Email body:',
                validate: (input) => input.trim() !== '' || 'Body is required',
            },
        ]);
        const email = {
            to: answers.to.split(',').map((email) => email.trim()),
            subject: answers.subject,
            body: answers.body,
            isHtml: answers.isHtml,
        };
        const draft = await manager.createDraft(email);
        console.log(chalk.green('✅ Draft created successfully!'));
        console.log(chalk.gray('Draft ID:'), draft.id);
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to create draft:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
draftCommand
    .command('send <draftId>')
    .description('Send a draft')
    .action(async (draftId) => {
    try {
        const sentMessage = await manager.sendDraft(draftId);
        console.log(chalk.green('✅ Draft sent successfully!'));
        console.log(chalk.gray('Message ID:'), sentMessage.id);
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to send draft:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
/**
 * ✅ **Batch Operations**
 */
const batchCommand = program
    .command('batch')
    .description('Batch operations on messages');
batchCommand
    .command('mark-read <messageIds...>')
    .description('Mark messages as read')
    .action(async (messageIds) => {
    try {
        const operation = {
            messageIds,
            action: 'read',
        };
        await manager.performBatchOperation(operation);
        console.log(chalk.green(`✅ Marked ${messageIds.length} messages as read`));
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to mark messages as read:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
batchCommand
    .command('archive <messageIds...>')
    .description('Archive messages')
    .action(async (messageIds) => {
    try {
        const operation = {
            messageIds,
            action: 'archive',
        };
        await manager.performBatchOperation(operation);
        console.log(chalk.green(`✅ Archived ${messageIds.length} messages`));
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to archive messages:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
/**
 * ✅ **Utility Commands**
 */
program
    .command('labels')
    .description('List all labels')
    .action(async () => {
    try {
        const response = await manager.getLabels();
        console.log(chalk.green(`🏷️ Found ${response.labels?.length || 0} labels:`));
        if (response.labels && response.labels.length > 0) {
            response.labels.forEach((label, index) => {
                console.log(chalk.gray(`${index + 1}. ${label.name} (${label.id}) - Type: ${label.type}`));
            });
        }
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to get labels:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
program
    .command('stats')
    .description('Show email statistics')
    .action(async () => {
    try {
        const stats = await manager.getEmailStats();
        console.log(chalk.green('📊 Email Statistics:'));
        console.log(chalk.gray('Total messages:'), stats.total);
        console.log(chalk.gray('Unread messages:'), stats.unread);
        console.log(chalk.gray('Archived messages:'), stats.archived);
        console.log(chalk.gray('Spam messages:'), stats.spam);
        console.log(chalk.gray('Trash messages:'), stats.trash);
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to get statistics:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
/**
 * ✅ **Context7 Commands**
 */
const context7Command = program
    .command('context7')
    .alias('docs')
    .description('Context7 documentation management');
context7Command
    .command('status')
    .description('Show Context7 status and cache stats')
    .action(async () => {
    try {
        const stats = manager.getContext7Stats();
        console.log(chalk.green('📚 Context7 Status:'));
        console.log(chalk.gray('Cache size:'), stats.size);
        console.log(chalk.gray('Cached operations:'), stats.keys.join(', ') || 'None');
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to get Context7 status:'), error instanceof Error ? error.message : error);
    }
});
context7Command
    .command('clear-cache')
    .description('Clear Context7 documentation cache')
    .action(async () => {
    try {
        manager.clearContext7Cache();
        console.log(chalk.green('✅ Context7 cache cleared'));
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to clear cache:'), error instanceof Error ? error.message : error);
    }
});
context7Command
    .command('get <operation>')
    .description('Get documentation for specific operation')
    .option('-c, --context <context>', 'Additional context for the operation')
    .action(async (operation, options) => {
    try {
        const docs = await manager.getDocumentation(operation, options.context);
        if (docs) {
            console.log(chalk.green(`📖 Documentation for: ${operation}`));
            console.log(chalk.gray('Documentation:'), docs.documentation);
            if (docs.examples && docs.examples.length > 0) {
                console.log(chalk.gray('Examples:'), docs.examples.join('\n'));
            }
            if (docs.relevantLinks && docs.relevantLinks.length > 0) {
                console.log(chalk.gray('Links:'), docs.relevantLinks.join('\n'));
            }
        }
        else {
            console.log(chalk.yellow('No documentation found for this operation'));
        }
    }
    catch (error) {
        console.error(chalk.red('❌ Failed to get documentation:'), error instanceof Error ? error.message : error);
    }
});
/**
 * ✅ **Error handling and execution**
 */
program.configureOutput({
    writeErr: (str) => process.stderr.write(chalk.red(str)),
});
// Handle unknown commands
program.on('command:*', () => {
    console.error(chalk.red('❌ Unknown command. Use --help for available commands.'));
    process.exit(1);
});
// Parse command line arguments
if (process.argv.length === 2) {
    program.help();
}
else {
    program.parse();
}
//# sourceMappingURL=cli.js.map