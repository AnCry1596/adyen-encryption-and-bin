function formatAddress(address, stateCodes) {
    if (!address || !address.state) {
        return {
            address1: 'N/A',
            address2: '',
            city: 'Unknown',
            state: 'XX',
            state_name: 'Unknown',
            region: 'Unknown',
            regionId: 'XX',
            postalCode: '00000'
        };
    }

    const stateInfo = stateCodes[address.state] || { name: 'Unknown', code: 'XX' };
    
    return {
        address1: address.address1 || 'N/A',
        address2: address.address2 || '',
        city: address.city || 'Unknown',
        state: address.state,
        state_name: stateInfo.name,
        region: stateInfo.name,
        regionId: stateInfo.code,
        postalCode: address.postalCode || '00000'
    };
}

module.exports = formatAddress;