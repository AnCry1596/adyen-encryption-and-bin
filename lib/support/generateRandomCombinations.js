/**
 * Enhanced email username generator with caching and better performance
 * Generates realistic email username combinations from first and last names
 */

// In-memory cache for generated combinations
class CombinationCache {
    constructor(maxSize = 1000, ttl = 300000) { // 5 minutes TTL, max 1000 entries
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    set(key, value) {
        // Clean old entries if cache is getting too large
        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }
        
        const expiresAt = Date.now() + this.ttl;
        this.cache.set(key, { value, expiresAt });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        // If still too large, remove oldest 20%
        if (this.cache.size >= this.maxSize) {
            const entries = Array.from(this.cache.entries());
            const toRemove = Math.floor(entries.length * 0.2);
            
            for (let i = 0; i < toRemove; i++) {
                this.cache.delete(entries[i][0]);
            }
            cleaned += toRemove;
        }
        
        console.log(`Cleaned ${cleaned} expired combination cache entries`);
    }

    clear() {
        this.cache.clear();
    }

    stats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl
        };
    }
}

// Global cache instance
const combinationCache = new CombinationCache();

// Cleanup every 10 minutes
setInterval(() => combinationCache.cleanup(), 600000);

/**
 * Generate random number with leading zeros for email usernames
 */
function generateRandomNumber() {
    const number = Math.floor(Math.random() * 10000);
    
    if (number < 10) {
        const prefixes = ['000', '00', '0', ''];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + number.toString();
    } else if (number < 100) {
        const prefixes = ['00', '0', ''];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + number.toString();
    } else if (number < 1000) {
        const prefixes = ['0', ''];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + number.toString();
    }
    
    return number.toString();
}

/**
 * Get random separator for email usernames
 */
function getRandomSeparator() {
    const separators = ['.', '_', '-', ''];
    return separators[Math.floor(Math.random() * separators.length)];
}

/**
 * Generate comprehensive list of email username patterns
 */
function generatePatterns(firstName, lastName, number) {
    const f = firstName.toLowerCase();
    const l = lastName.toLowerCase();
    const n = number;
    const s1 = getRandomSeparator();
    const s2 = getRandomSeparator();
    
    // Comprehensive pattern list with realistic email formats
    const patterns = [
        // Basic combinations
        `${f}${l}`,
        `${f}${s1}${l}`,
        `${l}${s1}${f}`,
        
        // With numbers
        `${f}${l}${n}`,
        `${f}${s1}${l}${n}`,
        `${l}${s1}${f}${n}`,
        `${f}${n}`,
        `${l}${n}`,
        `${n}${f}${l}`,
        `${n}${f}`,
        `${n}${l}`,
        
        // More complex patterns
        `${f}${s1}${l}${s2}${n}`,
        `${l}${s1}${f}${s2}${n}`,
        `${f}${s1}${n}${s2}${l}`,
        `${l}${s1}${n}${s2}${f}`,
        `${n}${s1}${f}${s2}${l}`,
        `${n}${s1}${l}${s2}${f}`,
        
        // First initial combinations
        `${f.charAt(0)}${l}`,
        `${f.charAt(0)}${s1}${l}`,
        `${f.charAt(0)}${l}${n}`,
        `${f.charAt(0)}${s1}${l}${n}`,
        
        // Last initial combinations
        `${f}${l.charAt(0)}`,
        `${f}${s1}${l.charAt(0)}`,
        `${f}${l.charAt(0)}${n}`,
        `${f}${s1}${l.charAt(0)}${n}`,
        
        // Both initials
        `${f.charAt(0)}${l.charAt(0)}${n}`,
        `${f.charAt(0)}${s1}${l.charAt(0)}${n}`,
        
        // Reversed patterns
        `${l}${f}`,
        `${l}${s1}${f}`,
        `${l}${f}${n}`,
        `${l}${s1}${f}${n}`,
        
        // Year-like numbers (common in emails)
        `${f}${l}${new Date().getFullYear() - Math.floor(Math.random() * 30)}`, // Birth year-ish
        `${f}${s1}${l}${new Date().getFullYear() - Math.floor(Math.random() * 30)}`,
        
        // Short numbers (1-99)
        `${f}${l}${Math.floor(Math.random() * 99) + 1}`,
        `${f}${s1}${l}${Math.floor(Math.random() * 99) + 1}`,
    ];
    
    // Remove duplicates and empty strings, clean up patterns
    const uniquePatterns = [...new Set(patterns)]
        .filter(pattern => pattern && pattern.length > 0)
        .map(pattern => pattern.replace(/[^a-z0-9._-]/g, '')) // Clean invalid chars
        .filter(pattern => pattern.length >= 2); // Minimum length
    
    return uniquePatterns;
}

/**
 * Main function to generate random email username combinations
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {object} options - Configuration options
 * @returns {Promise<string[]>} Array of email username combinations
 */
async function generateRandomCombinations(firstName, lastName, options = {}) {
    try {
        // Validate inputs
        if (!firstName || !lastName) {
            throw new Error('Both firstName and lastName are required');
        }
        
        // Clean inputs
        const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
        const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
        
        if (!cleanFirst || !cleanLast) {
            throw new Error('Invalid firstName or lastName after cleaning');
        }
        
        // Configuration with defaults
        const config = {
            count: options.count || 32, // Number of combinations to return
            useCache: options.useCache !== false, // Cache enabled by default
            minLength: options.minLength || 2,
            maxLength: options.maxLength || 50,
            ...options
        };
        
        // Create cache key
        const cacheKey = `${cleanFirst}_${cleanLast}_${config.count}`;
        
        // Check cache first
        if (config.useCache) {
            const cached = combinationCache.get(cacheKey);
            if (cached) {
                return cached.slice(0, config.count); // Return requested count
            }
        }
        
        // Generate random number for this batch
        const number = generateRandomNumber();
        
        // Generate all possible patterns
        const allPatterns = generatePatterns(cleanFirst, cleanLast, number);
        
        // Add some additional creative patterns
        const creativePatterns = [
            `${cleanFirst.slice(0, 2)}${cleanLast.slice(-2)}${number}`,
            `${cleanFirst.slice(-2)}${cleanLast.slice(0, 2)}${number}`,
            `${cleanFirst}${cleanLast.slice(0, 1)}${number}`,
            `${cleanFirst.slice(0, 1)}${cleanLast}${number}`,
        ];
        
        allPatterns.push(...creativePatterns);
        
        // Filter by length requirements
        const filteredPatterns = allPatterns.filter(pattern => 
            pattern.length >= config.minLength && 
            pattern.length <= config.maxLength
        );
        
        // Shuffle the array for randomness
        const shuffled = filteredPatterns.sort(() => Math.random() - 0.5);
        
        // Take requested count
        const result = shuffled.slice(0, config.count);
        
        // Ensure we have enough results
        if (result.length < config.count) {
            // Generate more with different numbers if needed
            while (result.length < config.count) {
                const extraNumber = generateRandomNumber();
                const extraPatterns = [
                    `${cleanFirst}${cleanLast}${extraNumber}`,
                    `${cleanFirst}${getRandomSeparator()}${cleanLast}${extraNumber}`,
                    `${cleanLast}${getRandomSeparator()}${cleanFirst}${extraNumber}`
                ].filter(p => !result.includes(p));
                
                result.push(...extraPatterns.slice(0, config.count - result.length));
            }
        }
        
        // Cache the result
        if (config.useCache) {
            combinationCache.set(cacheKey, result);
        }
        
        return result.slice(0, config.count);
        
    } catch (error) {
        console.error('Error generating random combinations:', error);
        // Fallback to simple combination
        const fallback = [
            `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
            `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`
        ];
        return fallback;
    }
}

// Export the main function
module.exports = generateRandomCombinations;

// Export additional utilities
module.exports.cache = {
    clear: () => combinationCache.clear(),
    cleanup: () => combinationCache.cleanup(),
    stats: () => combinationCache.stats()
};

// Export sync version for simple use cases
module.exports.sync = function(firstName, lastName, options = {}) {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    const number = generateRandomNumber();
    
    return generatePatterns(cleanFirst, cleanLast, number)
        .slice(0, options.count || 32);
};