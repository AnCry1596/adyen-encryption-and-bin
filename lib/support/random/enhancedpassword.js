const generatePassword = require('generate-password');

// Enhanced password generation with fallback
function generateEnhancedPassword(options = {}) {
    const {
        length: rawLength,
        symbols,
        uppercase,
        lowercase = true,
        numbers = true,
        exclude = '"\'`\\|<>[]{}',
        strict = true,
        randomize = false
    } = options;

  // Length: default 12 unless randomize requests 8–16 inclusive
    const length = clamp(
        4,
        128,
        typeof rawLength === 'number'
        ? rawLength
        : (randomize ? randIntInclusive(8, 16) : 12)
    );

    // Deterministic defaults; optionally randomized behavior
    const includeSymbols   = symbols   ?? (randomize ? Math.random() > 0.3 : true);
    const includeUppercase = uppercase ?? (randomize ? Math.random() > 0.2 : true);
    const includeLowercase = lowercase;
    const includeNumbers   = numbers;

    // Ensure at least one category is enabled
    if (![includeLowercase, includeUppercase, includeNumbers, includeSymbols].some(Boolean)) {
        return generateFallbackPassword(length, {
            includeLowercase: true, includeUppercase: false, includeNumbers: true, includeSymbols: false, exclude
        });
    }

    const passwordOptions = {
        length,
        numbers: includeNumbers,
        symbols: includeSymbols,
        lowercase: includeLowercase,
        uppercase: includeUppercase,
        exclude,
        strict: Boolean(strict) && length >= 4
    };

    try {
        if (typeof generatePassword?.generate === 'function') {
            const pwd = generatePassword.generate(passwordOptions);
        if (pwd && pwd.length) return pwd;
        }
    } catch (err) {
        console.error('Password generation error:', err);
    }

  // Secure fallback
    return generateFallbackPassword(length, {
        includeLowercase, includeUppercase, includeNumbers, includeSymbols, exclude, strict: passwordOptions.strict
    });
}

function generateFallbackPassword(
    length,
    {
        includeLowercase = true,
        includeUppercase = true,
        includeNumbers = true,
        includeSymbols = true,
        exclude = '',
        strict = true
    } = {}
) {
    const sets = {
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        nums:  '0123456789',
        syms:  '!@#$%^&*()-_=+~;:.,?'
    };

    // Build pool with exclusions applied
    const enabled = [];
    if (includeLowercase) enabled.push(filterOut(sets.lower, exclude));
    if (includeUppercase) enabled.push(filterOut(sets.upper, exclude));
    if (includeNumbers)   enabled.push(filterOut(sets.nums,  exclude));
    if (includeSymbols)   enabled.push(filterOut(sets.syms,  exclude));

    const pool = enabled.join('');
    if (!pool.length) throw new Error('No characters available after exclusions.');

    // If strict, ensure at least one from each enabled set
    const chars = [];
    if (strict) {
        for (const set of enabled) {
            if (!set.length) continue;
            chars.push(sampleCrypto(set));
        }
    }

    // Fill remaining
    while (chars.length < length) {
        chars.push(sampleCrypto(pool));
    }

    // Shuffle securely
    shuffleCrypto(chars);
    return chars.join('');
}

// ---------- Helpers ----------

function clamp(min, max, n) {
    return Math.max(min, Math.min(max, n));
}

function randIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function filterOut(str, exclude) {
    if (!exclude) return str;
    const ex = new Set([...exclude]);
    return [...str].filter(c => !ex.has(c)).join('');
}

function sampleCrypto(str) {
    const idx = cryptoRandomInt(0, str.length - 1);
    return str[idx];
}

function shuffleCrypto(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = cryptoRandomInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function cryptoRandomInt(min, max) {
    const range = max - min + 1;
    const maxUint32 = 0xFFFFFFFF;
    const maxRange = maxUint32 - (maxUint32 % range);

    let x;
    do {
        x = getUint32();
    } while (x >= maxRange);
    return min + (x % range);
}

function getUint32() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const a = new Uint32Array(1);
        crypto.getRandomValues(a);
        return a[0] >>> 0;
    }
    // Node fallback
    try {
        const { randomBytes } = require('crypto');
        const buf = randomBytes(4);
        return (buf.readUInt32BE(0)) >>> 0;
    } catch {
        // Last resort (not cryptographically strong)
        return Math.floor(Math.random() * 0x100000000) >>> 0;
    }
}

module.exports = generateEnhancedPassword;