/**
 * Authentication Service for Gmail MCP Server
 * Based on Google Auth Library for Node.js documentation
 * Source: https://github.com/googleapis/google-auth-library-nodejs
 */
import { OAuth2Client } from 'google-auth-library';
import type { GmailMCPConfig } from './types.js';
export declare class AuthService {
    private oAuth2Client;
    private config;
    private tokenStoragePath;
    constructor(config: GmailMCPConfig);
    /**
     * ✅ **Authenticate user with OAuth2 flow**
     * **Source**: Google Auth Library documentation via Context7
     * **Functionality**: Complete OAuth2 authentication with token persistence
     * **Security Alert**: Tokens are stored locally - ensure proper file permissions
     */
    authenticate(): Promise<OAuth2Client>;
    /**
     * Perform complete OAuth2 authentication flow
     * Based on Context7 documentation example
     */
    private performOAuth2Flow;
    /**
     * Check if current token is valid
     */
    private isTokenValid;
    /**
     * Refresh access token using refresh token
     */
    private refreshToken;
    /**
     * Load tokens from storage
     */
    private loadTokens;
    /**
     * Save tokens to storage
     * **Security**: Ensure file has proper permissions (600)
     */
    private saveTokens;
    /**
     * Get authenticated OAuth2 client
     */
    getAuthenticatedClient(): OAuth2Client;
    /**
     * Revoke tokens and clear storage
     */
    logout(): Promise<void>;
    /**
     * Get current token info for debugging
     */
    getTokenInfo(): Promise<any>;
    /**
     * Create AuthService from environment variables
     * **Usage**: For quick setup with .env file
     */
    static fromEnvironment(): AuthService;
}
//# sourceMappingURL=auth.service.d.ts.map