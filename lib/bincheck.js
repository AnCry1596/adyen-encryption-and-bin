"use strict";

const path = require("path");
const fs = require("fs");

/**
 * Enhanced BIN Checker with multi-layer caching, rate limiting, and improved performance
 */

// Multi-layer cache implementation
class BinCache {
    constructor() {
        // L1: Hot cache for frequently accessed BINs (5 minute TTL)
        this.hotCache = new Map();
        this.hotCacheTTL = 5 * 60 * 1000; // 5 minutes
        this.hotCacheMaxSize = 500;
        
        // L2: Warm cache for recently accessed BINs (1 hour TTL)
        this.warmCache = new Map();
        this.warmCacheTTL = 60 * 60 * 1000; // 1 hour
        this.warmCacheMaxSize = 5000;
        
        // L3: Cold cache for all BINs (24 hour TTL)
        this.coldCache = new Map();
        this.coldCacheTTL = 24 * 60 * 60 * 1000; // 24 hours
        this.coldCacheMaxSize = 50000;
        
        // Cache statistics
        this.stats = {
            hotHits: 0,
            warmHits: 0,
            coldHits: 0,
            misses: 0,
            sets: 0
        };
    }

    get(bin) {
        const now = Date.now();
        
        // Check hot cache first (most frequent)
        const hotItem = this.hotCache.get(bin);
        if (hotItem && now < hotItem.expiresAt) {
            this.stats.hotHits++;
            return hotItem.data;
        }
        
        // Check warm cache
        const warmItem = this.warmCache.get(bin);
        if (warmItem && now < warmItem.expiresAt) {
            this.stats.warmHits++;
            // Promote to hot cache
            this.setHot(bin, warmItem.data);
            return warmItem.data;
        }
        
        // Check cold cache
        const coldItem = this.coldCache.get(bin);
        if (coldItem && now < coldItem.expiresAt) {
            this.stats.coldHits++;
            // Promote to warm cache
            this.setWarm(bin, coldItem.data);
            return coldItem.data;
        }
        
        this.stats.misses++;
        return null;
    }

    set(bin, data) {
        this.stats.sets++;
        this.setCold(bin, data);
        this.setWarm(bin, data);
        this.setHot(bin, data);
    }

    setHot(bin, data) {
        if (this.hotCache.size >= this.hotCacheMaxSize) {
            this.cleanupCache(this.hotCache, Math.floor(this.hotCacheMaxSize * 0.2));
        }
        this.hotCache.set(bin, {
            data,
            expiresAt: Date.now() + this.hotCacheTTL
        });
    }

    setWarm(bin, data) {
        if (this.warmCache.size >= this.warmCacheMaxSize) {
            this.cleanupCache(this.warmCache, Math.floor(this.warmCacheMaxSize * 0.2));
        }
        this.warmCache.set(bin, {
            data,
            expiresAt: Date.now() + this.warmCacheTTL
        });
    }

    setCold(bin, data) {
        if (this.coldCache.size >= this.coldCacheMaxSize) {
            this.cleanupCache(this.coldCache, Math.floor(this.coldCacheMaxSize * 0.2));
        }
        this.coldCache.set(bin, {
            data,
            expiresAt: Date.now() + this.coldCacheTTL
        });
    }

    cleanupCache(cache, removeCount) {
        const entries = Array.from(cache.entries());
        const now = Date.now();
        
        // First remove expired entries
        let removed = 0;
        for (const [key, value] of entries) {
            if (now > value.expiresAt) {
                cache.delete(key);
                removed++;
            }
        }
        
        // If we need to remove more, remove oldest entries
        if (removed < removeCount) {
            const remaining = Array.from(cache.entries())
                .sort((a, b) => a[1].expiresAt - b[1].expiresAt);
            
            for (let i = 0; i < (removeCount - removed) && i < remaining.length; i++) {
                cache.delete(remaining[i][0]);
            }
        }
    }

    cleanup() {
        const now = Date.now();
        
        [this.hotCache, this.warmCache, this.coldCache].forEach(cache => {
            for (const [key, value] of cache.entries()) {
                if (now > value.expiresAt) {
                    cache.delete(key);
                }
            }
        });
    }

    getStats() {
        return {
            ...this.stats,
            hotCacheSize: this.hotCache.size,
            warmCacheSize: this.warmCache.size,
            coldCacheSize: this.coldCache.size,
            totalSize: this.hotCache.size + this.warmCache.size + this.coldCache.size,
            hitRate: ((this.stats.hotHits + this.stats.warmHits + this.stats.coldHits) / 
                     (this.stats.hotHits + this.stats.warmHits + this.stats.coldHits + this.stats.misses) * 100).toFixed(2) + '%'
        };
    }

    clear() {
        this.hotCache.clear();
        this.warmCache.clear();
        this.coldCache.clear();
        this.stats = {
            hotHits: 0,
            warmHits: 0,
            coldHits: 0,
            misses: 0,
            sets: 0
        };
    }
}


// Global instances
const binCache = new BinCache();

// Cleanup intervals
setInterval(() => binCache.cleanup(), 5 * 60 * 1000); // Every 5 minutes

// Lazy load country data
let countryData = null;
function getCountryData() {
    if (!countryData) {
        try {
            countryData = require("./support/ISO3166-1.alpha2.json");
        } catch (error) {
            console.error('Error loading country data:', error);
            countryData = {};
        }
    }
    return countryData;
}

// Lazy load BIN data
let binDataCache = null;
function getBinData() {
    if (!binDataCache) {
        try {
            const binDataPath = path.join(__dirname, '../data/bindata.json');
            const rawData = fs.readFileSync(binDataPath, 'utf-8');
            binDataCache = JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading BIN data:', error);
            binDataCache = {};
        }
    }
    return binDataCache;
}

// BIN validation
function validateBin(bin) {
    if (!bin) {
        return { valid: false, error: "BIN is required" };
    }
    
    // Convert to string and clean
    const cleanBin = String(bin).replace(/\D/g, '');
    
    if (cleanBin.length < 6) {
        return { valid: false, error: "BIN must be at least 6 digits" };
    }
    
    if (cleanBin.length > 19) {
        return { valid: false, error: "BIN too long" };
    }
    
    return { valid: true, cleanBin };
}

// Get client IP with better detection
function getClientIp(req) {
    return req.headers['cf-connecting-ip'] ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.connection?.socket?.remoteAddress ||
           req.clientIp ||
           'unknown';
}

// Enhanced response formatter
function formatBinResponse(data, binPrefix) {
    const country = getCountryData();
    
    // Handle error cases
    if (!data || data.error) {
        return {
            success: false,
            error: data?.error || "Invalid BIN or data not found",
            bin: binPrefix
        };
    }
    
    // Format successful response
    return {
        success: true,
        bin: binPrefix,
        cardInfo: {
            type: data.cardType || "Unknown",
            subType: data.cardSubType || "Unknown",
            category: data.cardCategory || "Unknown",
            regulated: data.cardRegulated || "Unknown"
        },
        binInfo: {
            category: data.binCategory || "Unknown",
            length: data.cardLength || "Unknown"
        },
        issuer: {
            bank: data.issuingBank || "Unknown",
            countryCode: data.issuingCountryCode || "",
            country: country[data.issuingCountryCode] || "Unknown"
        },
        metadata: {
            cached: true,
            timestamp: new Date().toISOString()
        }
    };
}

// Main BIN checker function
module.exports = async function binCheck(req, res) {
    const startTime = Date.now();
    let cached = false;
    
    try {
        // Get client IP
        const clientIp = getClientIp(req);
        
        
        // Get and validate BIN
        const bin = req.query.bin || req.params.BIN || req.body.bin;
        const validation = validateBin(bin);
        
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }
        
        const binPrefix = validation.cleanBin.slice(0, 6);
        
        // Log request
        console.log(`BIN Check - IP: ${clientIp}, BIN: ${binPrefix}, Time: ${new Date().toISOString()}`);
        
        // Check cache first
        let binData = binCache.get(binPrefix);

        if (binData) {
            cached = true;
            console.log(`Cache hit for BIN: ${binPrefix}`);
        } else {
            // Cache miss - read from bindata.json only
            console.log(`Cache miss for BIN: ${binPrefix}, reading from file...`);

            try {
                const binDatabase = getBinData();
                binData = binDatabase[binPrefix];

                // If not found in database, return Unknown
                if (!binData) {
                    console.log(`BIN ${binPrefix} not found in database, returning Unknown`);
                    binData = {
                        cardType: "Unknown",
                        cardSubType: "Unknown",
                        cardCategory: "Unknown",
                        binCategory: "Unknown",
                        cardRegulated: "Unknown",
                        issuingBank: "Unknown",
                        issuingCountryCode: ""
                    };
                }

                // Cache the result (even if it's Unknown, to prevent repeated lookups)
                binCache.set(binPrefix, binData);

            } catch (error) {
                console.error(`Error reading BIN data for ${binPrefix}:`, error);
                return res.status(500).json({
                    success: false,
                    error: "Unable to retrieve BIN information"
                });
            }
        }
        
        // Format and return response
        const response = formatBinResponse(binData, binPrefix);
        response.metadata = {
            ...response.metadata,
            cached,
            processingTime: `${Date.now() - startTime}ms`,
            cacheStats: cached ? "hit" : "miss"
        };
        
        return res.json(response);
        
    } catch (error) {
        console.error('Unexpected error in BIN check:', error);
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred",
            processingTime: `${Date.now() - startTime}ms`
        });
    }
};

// Export cache management functions
module.exports.cache = {
    clear: () => binCache.clear(),
    stats: () => binCache.getStats(),
    cleanup: () => binCache.cleanup()
};


// Batch BIN checker for multiple BINs
module.exports.batchCheck = async function(bins, options = {}) {
    const results = [];
    const { maxConcurrent = 10, timeout = 30000 } = options;

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < bins.length; i += maxConcurrent) {
        const batch = bins.slice(i, i + maxConcurrent);

        const batchPromises = batch.map(async (bin) => {
            try {
                const validation = validateBin(bin);
                if (!validation.valid) {
                    return { bin, error: validation.error };
                }

                const binPrefix = validation.cleanBin.slice(0, 6);
                let binData = binCache.get(binPrefix);

                if (!binData) {
                    const binDatabase = getBinData();
                    binData = binDatabase[binPrefix];

                    // If not found in database, return Unknown
                    if (!binData) {
                        binData = {
                            cardType: "Unknown",
                            cardSubType: "Unknown",
                            cardCategory: "Unknown",
                            binCategory: "Unknown",
                            cardRegulated: "Unknown",
                            issuingBank: "Unknown",
                            issuingCountryCode: ""
                        };
                    }

                    binCache.set(binPrefix, binData);
                }

                return formatBinResponse(binData, binPrefix);
            } catch (error) {
                return { bin, error: error.message };
            }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }));
    }

    return results;
};