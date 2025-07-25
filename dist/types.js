/**
 * Types and interfaces for Gmail MCP Server
 */
// Error types
export class GmailMCPError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'GmailMCPError';
    }
}
export class AuthenticationError extends GmailMCPError {
    constructor(message) {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}
export class APIError extends GmailMCPError {
    constructor(message, statusCode) {
        super(message, 'API_ERROR', statusCode);
        this.name = 'APIError';
    }
}
//# sourceMappingURL=types.js.map