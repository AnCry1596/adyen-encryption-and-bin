const path = require('path');
const { faker, da } = require('@faker-js/faker');
const getTimezoneOffset = require('get-timezone-offset');
const replaceNonAlphabetic = require('./support/replaceNonAlphabetic');
const generateRandomCombinations = require('./support/generateRandomCombinations');
const stateCodes = require('./support/state_code.json');
const readFileToArray = require('./support/readFileToArray');
const phonenumberUtil = require('./support/random/USNumber');
const SCREEN_RESOLUTIONS = require('./support/random/screen');
const LEGACY_SCREEN_RESOLUTIONS = require('./support/random/legacy_screen');
const getWeightedRandom = require('./support/random/weightedRandom');
const formatPhone = require('./support/random/formatPhone');
const generateEnhancedPassword = require('./support/random/enhancedpassword');
const formatAddress = require('./support/random/formatAddress');
const getClientIp = require('./support/random/clientIp');

// Shared data generation function
async function generateRandomData(options = {}) {
    const staticData = await getStaticDataCached();
    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
    
    const firstName = await replaceNonAlphabetic(faker.person.firstName());
    const lastName = await replaceNonAlphabetic(faker.person.lastName());
    const domain = getRandomItem(staticData.mailDomainList);
    const email = getRandomItem(await generateRandomCombinations(firstName.toLowerCase(), lastName.toLowerCase()));
    const language = getRandomItem(staticData.languageList);
    const ua = getRandomItem(staticData.userAgentList);
    const comment = getRandomItem(staticData.commentsList);
    const timezone = faker.location.timeZone();
    const offset = getTimezoneOffset(timezone, new Date());
    const address = getRandomItem(staticData.addresses);
    const phone = phonenumberUtil.generateValidUSPhone(address.state);

    return {
        firstName,
        lastName,
        phone,
        domain,
        email,
        language,
        ua,
        comment,
        timezone,
        offset,
        address,
        staticData
    };
}

// ORIGINAL FORMAT ENDPOINT (for /randomdatav2)
module.exports = async function(req, res, next) {    
    console.log('Generating random data with original format');
    
    try {
        const data = await generateRandomData();
        const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
        
        // Use legacy screen resolution format
        const screen = getRandomItem(LEGACY_SCREEN_RESOLUTIONS);
        const colorDepth = getRandomItem([16, 24, 32]);

        // ORIGINAL FLAT RESPONSE FORMAT
        res.json({
            success: true,
            first: data.firstName,
            last: data.lastName,
            fullname: `${data.firstName} ${data.lastName}`,
            email: `${data.email}@${data.domain}`.toLowerCase(),
            password: generateEnhancedPassword({
                length: 12,
                numbers: true,
                symbols: true,
                lowercase: true,
                uppercase: true,
                exclude: '"',
                strict: true
            }),
            phone: data.phone.raw,
            formatedphone: data.phone.formatted,
            formatedphone2: data.phone.dashed,
            userAgent: data.ua,
            language: data.language,
            timeZone: data.timezone,
            offset: data.offset,
            colorDepth: colorDepth,
            screen: screen,
            comment: data.comment,
            address: {
                address1: data.address.address1,
                address2: data.address.address2,
                city: data.address.city,
                state: data.address.state,
                state_name: stateCodes[data.address.state].name,
                region: stateCodes[data.address.state].name,
                regionId: stateCodes[data.address.state].code,
                postalCode: data.address.postalCode,
            }
        });
    } catch (err) {
        console.error('Error in random data generation:', err);
        next(err);
    }
};

// NEW FORMAT ENDPOINT (for /randomdatav2/new)
module.exports.newFormat = async function(req, res, next) {
    const startTime = Date.now();
    
    console.log('Generating random data with new structured format');
    
    try {
        // Get request options
        const options = {
            country: req.query.country || req.body.country || 'US',
            passwordLength: parseInt(req.query.passwordLength) || undefined,
            phoneFormat: req.query.phoneFormat || 'random',
            includeMetadata: req.query.metadata !== 'false'
        };

        const data = await generateRandomData(options);
        const clientIp = getClientIp(req);
        
        // Use enhanced screen resolution format
        const screen = getWeightedRandom(SCREEN_RESOLUTIONS);
        const colorDepth = getWeightedRandom([
            { value: 24, weight: 70 },
            { value: 32, weight: 25 },
            { value: 16, weight: 5 }
        ]).value;

        // NEW STRUCTURED RESPONSE FORMAT
        const response = {
            success: true,
            personal: {
                first: data.firstName,
                last: data.lastName,
                fullname: `${data.firstName} ${data.lastName}`,
                email: `${data.email}@${data.domain}`.toLowerCase(),
                phone: data.phone.raw,
                phoneFormatted: {
                    parentheses: data.phone.formatted,
                    dashes: data.phone.dashed,
                    dots: data.phone.dotted,
                    international: data.phone.international
                }
            },
            security: {
                password: generateEnhancedPassword({
                        length: 12,
                        uppercase: true,
                        lowercase: true,
                        numbers: true,
                        symbols: true,
                        strict: true
                        })
            },
            browser: {
                userAgent: data.ua,
                language: data.language,
                colorDepth: colorDepth,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    type: screen.type
                }
            },
            location: {
                timeZone: data.timezone,
                offset: data.offset,
                address: formatAddress(data.address, stateCodes)
            },
            misc: {
                comment: data.comment
            }
        };

        // Add metadata if requested
        if (options.includeMetadata) {
            response.metadata = {
                generatedAt: new Date().toISOString(),
                processingTime: `${Date.now() - startTime}ms`,
                clientIp: clientIp,
                cacheUsed: true,
                version: '2.1-randomdata',
                format: 'structured'
            };
        }

        // Legacy compatibility fields (for easier migration)
        // response.legacy = {
        //     first: response.personal.first,
        //     last: response.personal.last,
        //     fullname: response.personal.fullname,
        //     email: response.personal.email,
        //     password: response.security.password,
        //     phone: response.personal.phone,
        //     formatedphone: response.personal.phoneFormatted.parentheses,
        //     formatedphone2: response.personal.phoneFormatted.dashes,
        //     userAgent: response.browser.userAgent,
        //     language: response.browser.language,
        //     timeZone: response.location.timeZone,
        //     offset: response.location.offset,
        //     colorDepth: response.browser.colorDepth,
        //     screen: response.browser.screen,
        //     comment: response.misc.comment,
        //     address: response.location.address
        // };

        res.json(response);
    } catch (err) {
        console.error('Error in new format random data generation:', err);
        
        res.status(500).json({
            success: false,
            error: 'Failed to generate random data',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
            processingTime: `${Date.now() - startTime}ms`
        });
    }
};

// Cache static data to avoid repeated file reads
let staticDataCache = null;
let staticDataLastLoaded = 0;
const STATIC_DATA_TTL = 10 * 60 * 1000; // 10 minutes

async function getStaticDataCached() {
    const now = Date.now();
    
    if (staticDataCache && (now - staticDataLastLoaded) < STATIC_DATA_TTL) {
        return staticDataCache;
    }
    
    console.log('Loading static data files...');
    try {
        const [userAgentList, commentsList, mailDomainList, languageList, addresses] = await Promise.all([
            readFileToArray(path.join(__dirname, '../data/user-agent.txt')),
            readFileToArray(path.join(__dirname, '../data/comments.txt')),
            readFileToArray(path.join(__dirname, '../data/mail-domain.txt')),
            readFileToArray(path.join(__dirname, '../data/language.txt')),
            Promise.resolve(require('./randomaddress/addressdata/addresses-us-all.json').addresses)
        ]);
        
        staticDataCache = {
            userAgentList,
            commentsList,
            mailDomainList,
            languageList,
            addresses
        };
        staticDataLastLoaded = now;
        
        console.log('Static data loaded and cached');
        return staticDataCache;
    } catch (error) {
        console.error('Error loading static data:', error);
        if (staticDataCache) {
            console.log('Using stale static data cache due to load error');
            return staticDataCache;
        }
        throw error;
    }
}

// Export function to clear static data cache if needed
module.exports.clearStaticCache = function() {
    staticDataCache = null;
    staticDataLastLoaded = 0;
    console.log('Static data cache cleared');
};