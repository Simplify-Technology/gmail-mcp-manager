/**
 * Context7 Integration Service for Gmail MCP Server
 * Automatically fetches relevant documentation based on functionality being used
 */
import type { Context7Response } from './types.js';
export declare class Context7Service {
    private enabled;
    private cache;
    private cacheExpiry;
    private readonly CACHE_DURATION;
    constructor(enabled?: boolean);
    /**
     * ✅ **Get relevant documentation for Gmail API functionality**
     * **Source**: Context7 MCP integration
     * **Functionality**: Fetches up-to-date documentation based on operation context
     * **Performance**: Implements caching to avoid repeated API calls
     */
    getRelevantDocumentation(operation: string, context?: string): Promise<Context7Response | null>;
    /**
     * ✅ **Display documentation in terminal (CLI mode)**
     * **Functionality**: Shows relevant documentation context in CLI
     */
    displayInTerminal(documentation: Context7Response, operation: string): void;
    /**
     * ✅ **Embed documentation as code comments**
     * **Functionality**: Returns documentation formatted as code comments
     */
    getAsCodeComments(documentation: Context7Response): string;
    /**
     * Map Gmail operations to Context7 search terms
     */
    private mapOperationToSearchTerm;
    /**
     * Simulate Context7 MCP integration
     * In real implementation, this would use the actual Context7 MCP client
     */
    private fetchFromContext7;
    /**
     * Get mock documentation for development/testing
     * In production, this would be replaced by actual Context7 responses
     */
    private getMockDocumentation;
    /**
     * Format documentation for terminal display
     */
    private formatDocumentationForTerminal;
    /**
     * Get cached response if valid
     */
    private getCachedResponse;
    /**
     * Set cached response with expiry
     */
    private setCachedResponse;
    /**
     * Clear all cached responses
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Enable or disable Context7 integration
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if Context7 is enabled
     */
    isEnabled(): boolean;
}
//# sourceMappingURL=context7.d.ts.map