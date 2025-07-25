/**
 * Authentication Service for Gmail MCP Server
 * Based on Google Auth Library for Node.js documentation
 * Source: https://github.com/googleapis/google-auth-library-nodejs
 */

import { OAuth2Client } from 'google-auth-library';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import http from 'http';
import { URL } from 'url';
import open from 'open';
import destroyer from 'server-destroy';
import dotenv from 'dotenv';
import type { OAuth2Config, TokenData, GmailMCPConfig } from './types.js';
import { AuthenticationError } from './types.js';

// Load environment variables
dotenv.config();

export class AuthService {
  private oAuth2Client: OAuth2Client;
  private config: OAuth2Config;
  private tokenStoragePath: string;

  constructor(config: GmailMCPConfig) {
    this.config = config.oauth2;
    this.tokenStoragePath = config.tokenStoragePath || join(homedir(), '.gmail-mcp-tokens.json');

    // Initialize OAuth2 client
    this.oAuth2Client = new OAuth2Client({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
    });
  }

  /**
   * ✅ **Authenticate user with OAuth2 flow**
   * **Source**: Google Auth Library documentation via Context7
   * **Functionality**: Complete OAuth2 authentication with token persistence
   * **Security Alert**: Tokens are stored locally - ensure proper file permissions
   */
  async authenticate(): Promise<OAuth2Client> {
    try {
      // Try to load existing tokens first
      const existingTokens = await this.loadTokens();
      if (existingTokens) {
        this.oAuth2Client.setCredentials(existingTokens);

        // Check if token is still valid or can be refreshed
        if (await this.isTokenValid()) {
          console.log('✅ Using existing valid tokens');
          return this.oAuth2Client;
        }
      }

      // If no valid tokens, start OAuth2 flow
      console.log('🔐 Starting OAuth2 authentication flow...');
      const authenticatedClient = await this.performOAuth2Flow();

      // Save tokens for future use
      await this.saveTokens(authenticatedClient.credentials as TokenData);
      console.log('✅ Authentication successful and tokens saved');

      return authenticatedClient;
    } catch (error) {
      throw new AuthenticationError(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform complete OAuth2 authentication flow
   * Based on Context7 documentation example
   */
  private async performOAuth2Flow(): Promise<OAuth2Client> {
    return new Promise((resolve, reject) => {
      // Generate authorization URL
      const authorizeUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.config.scopes,
        prompt: 'consent', // Force consent to get refresh token
      });

      console.log('🌐 Opening browser for authentication...');
      console.log(`If browser doesn't open, visit: ${authorizeUrl}`);

      // Create HTTP server to handle OAuth callback
      const server = http.createServer(async (req, res) => {
        try {
          if (req.url && req.url.indexOf('/oauth2callback') > -1) {
            const qs = new URL(req.url, 'http://localhost:3000').searchParams;
            const code = qs.get('code');
            const error = qs.get('error');

            if (error) {
              res.end(`❌ Authentication failed: ${error}`);
              server.destroy();
              reject(new AuthenticationError(`OAuth2 error: ${error}`));
              return;
            }

            if (!code) {
              res.end('❌ No authorization code received');
              server.destroy();
              reject(new AuthenticationError('No authorization code received'));
              return;
            }

            console.log(`📝 Authorization code received: ${code.substring(0, 10)}...`);
            res.end('✅ Authentication successful! You can close this window and return to the terminal.');
            server.destroy();

            // Exchange code for tokens
            const tokenResponse = await this.oAuth2Client.getToken(code);
            this.oAuth2Client.setCredentials(tokenResponse.tokens);

            console.log('🎫 Tokens acquired successfully');
            resolve(this.oAuth2Client);
          }
        } catch (err) {
          res.end(`❌ Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          server.destroy();
          reject(err);
        }
      });

      // Start server and open browser
      server.listen(3000, () => {
        console.log('🚀 Local server started on http://localhost:3000');
        open(authorizeUrl, { wait: false }).catch(console.error);
      });

      // Enable server destruction
      destroyer(server);

      // Timeout after 5 minutes
      setTimeout(() => {
        server.destroy();
        reject(new AuthenticationError('Authentication timeout - please try again'));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Check if current token is valid
   */
  private async isTokenValid(): Promise<boolean> {
    try {
      const tokenInfo = await this.oAuth2Client.getTokenInfo(
        this.oAuth2Client.credentials.access_token!
      );

      // Check if token expires soon (within 5 minutes)
      const expiryDate = this.oAuth2Client.credentials.expiry_date;
      if (expiryDate && expiryDate - Date.now() < 5 * 60 * 1000) {
        console.log('🔄 Token expires soon, refreshing...');
        await this.refreshToken();
      }

      return !!tokenInfo;
    } catch (error) {
      console.log('⚠️ Token validation failed, will re-authenticate');
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<void> {
    try {
      const refreshResponse = await this.oAuth2Client.refreshAccessToken();
      this.oAuth2Client.setCredentials(refreshResponse.credentials);
      await this.saveTokens(refreshResponse.credentials as TokenData);
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      throw new AuthenticationError(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Load tokens from storage
   */
  private async loadTokens(): Promise<TokenData | null> {
    try {
      const tokenData = await fs.readFile(this.tokenStoragePath, 'utf-8');
      return JSON.parse(tokenData) as TokenData;
    } catch (error) {
      // File doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Save tokens to storage
   * **Security**: Ensure file has proper permissions (600)
   */
  private async saveTokens(tokens: TokenData): Promise<void> {
    try {
      await fs.writeFile(this.tokenStoragePath, JSON.stringify(tokens, null, 2), {
        mode: 0o600, // Read/write for owner only
      });
    } catch (error) {
      throw new AuthenticationError(
        `Failed to save tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get authenticated OAuth2 client
   */
  getAuthenticatedClient(): OAuth2Client {
    if (!this.oAuth2Client.credentials.access_token) {
      throw new AuthenticationError('No valid authentication. Please run authenticate() first.');
    }
    return this.oAuth2Client;
  }

  /**
   * Revoke tokens and clear storage
   */
  async logout(): Promise<void> {
    try {
      if (this.oAuth2Client.credentials.access_token) {
        await this.oAuth2Client.revokeCredentials();
      }

      // Clear stored tokens
      try {
        await fs.unlink(this.tokenStoragePath);
      } catch (error) {
        // File might not exist, ignore
      }

      // Clear in-memory credentials
      this.oAuth2Client.setCredentials({});

      console.log('✅ Logout successful - all tokens revoked and cleared');
    } catch (error) {
      throw new AuthenticationError(
        `Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get current token info for debugging
   */
  async getTokenInfo(): Promise<any> {
    try {
      if (!this.oAuth2Client.credentials.access_token) {
        throw new AuthenticationError('No access token available');
      }

      return await this.oAuth2Client.getTokenInfo(this.oAuth2Client.credentials.access_token);
    } catch (error) {
      throw new AuthenticationError(
        `Failed to get token info: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create AuthService from environment variables
   * **Usage**: For quick setup with .env file
   */
  static fromEnvironment(): AuthService {
    const config: GmailMCPConfig = {
      oauth2: {
        clientId: process.env['GOOGLE_CLIENT_ID'] || '',
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
        redirectUri: process.env['GOOGLE_REDIRECT_URI'] || 'http://localhost:3000/oauth2callback',
        scopes: (process.env['GOOGLE_SCOPES'] || 'https://www.googleapis.com/auth/gmail.modify').split(','),
      },
      tokenStoragePath: process.env['TOKEN_STORAGE_PATH'] || undefined,
      defaultUserId: process.env['DEFAULT_USER_ID'] || 'me',
      context7Enabled: process.env['CONTEXT7_ENABLED'] === 'true',
    };

    if (!config.oauth2.clientId || !config.oauth2.clientSecret) {
      throw new AuthenticationError(
        'Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
      );
    }

    return new AuthService(config);
  }
}