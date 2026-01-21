"use strict";
const AdyenCardType = require('./support/AdyenCardType');
module.exports = async function(req, res) {
    try {
        const ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress || req.clientIp;
        const keyen = req.body.key || req.body['key'];
        const referrer = req.body.referrer || req.body['referrer'];
        const ccnum = req.body.cc || req.body['cc'];
        const ccmonth = req.body.month || req.body['month'];
        const ccyear = req.body.year || req.body['year'];
        const cccvv = req.body.cvv || req.body['cvv'];

        if (!keyen || !referrer || !ccnum || !ccmonth || !ccyear || !cccvv) {
            return res.json({
                success: false,
                error: 'Missing input data!'
            });
        }

        const versionMatch = referrer.match(/\/([^/]*)\/securedFields.html/)[1];

        console.log(`[${ip}] - Post Adyen v${versionMatch}(Encrypted) - Data: ${ccnum}|${ccmonth}|${ccyear}|${cccvv}`);

        let encryptCardData;
        // if (semver.lt(versionMatch, '4.5.0')) {
            encryptCardData = require('adyen-4.4.1');
        // } else {
        //     encryptCardData = require('adyen-4.5.0');
        // }

        const encryptedData = await encryptCardData(ccnum, ccmonth, ccyear, cccvv, keyen, referrer);
        var brand = await AdyenCardType(ccnum)
        res.json({
            success: true,
            version: versionMatch,
            encryptedCardNumber: encryptedData.encryptedCardNumber,
            encryptedExpiryMonth: encryptedData.encryptedExpiryMonth,
            encryptedExpiryYear: encryptedData.encryptedExpiryYear,
            encryptedSecurityCode: encryptedData.encryptedSecurityCode,
            brand: brand
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};
