export class MaliciousInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MaliciousInputError';
    }
}

export const validateSearchInput = (input: string): string => {
    // Check length
    if (input.length > 30) {
        throw new MaliciousInputError('Search query too long (max 30 characters)');
    }

    // Check for HTML/script tags
    if (/<|>|`|javascript:|script|onclick|onerror/i.test(input)) {
        throw new MaliciousInputError('Search contains invalid characters or scripts');
    }

    // Check for SQL-like patterns (extra safety)
    if (/;|--|\*|union|select|insert|drop/i.test(input)) {
        throw new MaliciousInputError('Search contains suspicious SQL patterns');
    }

    return input.trim();
};

export const validateAndSanitizeUrl = (url: string): string => {
    if (!url || url.trim() === '') {
        throw new MaliciousInputError('URL cannot be empty');
    }

    try {
        const parsed = new URL(url);

        // Only allow http/https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new MaliciousInputError(`Invalid protocol: ${parsed.protocol}. Only http/https allowed`);
        }

        // Block suspicious domains
        const hostname = parsed.hostname.toLowerCase();
        if (hostname.includes('javascript') || hostname.includes('data:') || hostname.includes('blob')) {
            throw new MaliciousInputError(`Suspicious domain detected: ${hostname}`);
        }

        // Check for localhost in production (optional)
        if (process.env.NODE_ENV === 'production' && /localhost|127.0.0.1|0.0.0.0/.test(hostname)) {
            throw new MaliciousInputError('Local URLs not allowed in production');
        }

        return parsed.toString();
    } catch (error) {
        if (error instanceof MaliciousInputError) {
            throw error;
        }
        throw new MaliciousInputError('Invalid URL format');
    }
};