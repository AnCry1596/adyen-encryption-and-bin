function generateValidUSPhone(state = null) {
    // Complete US area codes by state/territory
    const areaCodesByState = {
        'AL': ['205', '251', '256', '334', '659', '938'],
        'AK': ['907'],
        'AZ': ['480', '520', '602', '623', '928'],
        'AR': ['327', '479', '501', '870'],
        'CA': ['209', '213', '279', '310', '323', '341', '350', '369', '408', '415', '424', '442', '510', '530', '559', '562', '619', '626', '628', '650', '657', '661', '669', '707', '714', '747', '760', '805', '818', '820', '831', '840', '858', '909', '916', '925', '949', '951'],
        'CO': ['303', '719', '720', '970', '983'],
        'CT': ['203', '475', '860', '959'],
        'DE': ['302'],
        'FL': ['239', '305', '321', '324', '352', '386', '407', '448', '561', '645', '656', '689', '727', '728', '754', '772', '786', '813', '850', '863', '904', '941', '954'],
        'GA': ['229', '404', '470', '478', '678', '706', '762', '770', '912', '943'],
        'HI': ['808'],
        'ID': ['208', '986'],
        'IL': ['217', '224', '309', '312', '331', '447', '464', '618', '630', '708', '730', '773', '779', '815', '847', '861', '872'],
        'IN': ['219', '260', '317', '463', '574', '765', '812', '930'],
        'IA': ['319', '515', '563', '641', '712'],
        'KS': ['316', '620', '785', '913'],
        'KY': ['270', '364', '502', '606', '859'],
        'LA': ['225', '318', '337', '504', '985'],
        'ME': ['207'],
        'MD': ['227', '240', '301', '410', '443', '667'],
        'MA': ['339', '351', '413', '508', '617', '774', '781', '857', '978'],
        'MI': ['231', '248', '269', '313', '517', '586', '616', '734', '810', '906', '947', '989'],
        'MN': ['218', '320', '507', '612', '651', '763', '952'],
        'MS': ['228', '601', '662', '769'],
        'MO': ['235', '314', '417', '557', '573', '636', '660', '816', '975'],
        'MT': ['406'],
        'NE': ['308', '402', '531'],
        'NV': ['702', '725', '775'],
        'NH': ['603'],
        'NJ': ['201', '551', '609', '640', '732', '848', '856', '862', '908', '973'],
        'NM': ['505', '575'],
        'NY': ['212', '315', '329', '332', '347', '363', '516', '518', '585', '607', '624', '631', '646', '680', '716', '718', '838', '845', '914', '917', '929', '934'],
        'NC': ['252', '336', '472', '704', '743', '828', '910', '919', '980', '984'],
        'ND': ['701'],
        'OH': ['216', '220', '234', '283', '326', '330', '380', '419', '436', '440', '513', '567', '614', '740', '937'],
        'OK': ['405', '539', '572', '580', '918'],
        'OR': ['458', '503', '541', '971'],
        'PA': ['215', '223', '267', '272', '412', '445', '484', '570', '582', '610', '717', '724', '814', '835', '878'],
        'RI': ['401'],
        'SC': ['803', '839', '843', '854', '864'],
        'SD': ['605'],
        'TN': ['423', '615', '629', '731', '865', '901', '931'],
        'TX': ['210', '214', '254', '281', '325', '346', '361', '409', '430', '432', '469', '512', '682', '713', '726', '737', '806', '817', '830', '832', '903', '915', '936', '940', '945', '956', '972', '979'],
        'UT': ['385', '435', '801'],
        'VT': ['802'],
        'VA': ['276', '434', '540', '571', '686', '703', '757', '804', '826', '948'],
        'WA': ['206', '253', '360', '425', '509', '564'],
        'DC': ['202', '771'],
        'WV': ['304', '681'],
        'WI': ['262', '274', '353', '414', '534', '608', '715', '920'],
        'WY': ['307'],
        // US Territories
        'AS': ['684'], // American Samoa
        'GU': ['671'], // Guam
        'MP': ['670'], // Northern Mariana Islands
        'PR': ['787', '939'], // Puerto Rico
        'VI': ['340']  // Virgin Islands
    };
    
    // All valid area codes (if no state specified)
    const allAreaCodes = Object.values(areaCodesByState).flat();
    
    // Valid exchange codes (200-999, but not ending in 11)
    const validExchanges = [];
    for (let i = 200; i <= 999; i++) {
        if (!i.toString().endsWith('11')) {
            validExchanges.push(i.toString().padStart(3, '0'));
        }
    }
    
    // Select area codes based on state parameter
    let availableAreaCodes;
    if (state && areaCodesByState[state.toUpperCase()]) {
        availableAreaCodes = areaCodesByState[state.toUpperCase()];
    } else {
        availableAreaCodes = allAreaCodes;
    }
    
    // Generate random components
    const areaCode = availableAreaCodes[Math.floor(Math.random() * availableAreaCodes.length)];
    const exchange = validExchanges[Math.floor(Math.random() * validExchanges.length)];
    const lineNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return {
        raw: areaCode + exchange + lineNumber,
        formatted: `(${areaCode}) ${exchange}-${lineNumber}`,
        dashed: `${areaCode}-${exchange}-${lineNumber}`,
        dotted: `${areaCode}.${exchange}.${lineNumber}`,
        international: `+1${areaCode}${exchange}${lineNumber}`
    };
}

// Utility function to get available states/territories
function getAvailableStates() {
    return {
        states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'DC', 'WV', 'WI', 'WY'],
        territories: ['AS', 'GU', 'MP', 'PR', 'VI']
    };
}

// Utility function to validate if a phone number uses a real area code
function isValidUSAreaCode(phoneNumber) {
    // Extract area code from various formats
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10 && cleanNumber.length !== 11) return false;
    
    const areaCode = cleanNumber.length === 11 ? cleanNumber.slice(1, 4) : cleanNumber.slice(0, 3);
    const allAreaCodes = Object.values(areaCodesByState).flat();
    
    return allAreaCodes.includes(areaCode);
}

// Usage examples:
// generateValidUSPhone();           // Random from all states/territories
// generateValidUSPhone('CA');       // California area code
// generateValidUSPhone('NY');       // New York area code
// generateValidUSPhone('PR');       // Puerto Rico area code

module.exports = { 
    generateValidUSPhone, 
    getAvailableStates, 
    isValidUSAreaCode 
};