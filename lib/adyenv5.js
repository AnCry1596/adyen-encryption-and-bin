"use strict";
const AdyenCardType = require('./support/AdyenCardType');
module.exports = async function(req, res) {
    try {
        const ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress || req.clientIp;
        const keyen = req.body.key || req.body['key'];
        const ccnum = req.body.cc || req.body['cc'];
        const ccmonth = req.body.month || req.body['month'];
        const ccyear = req.body.year || req.body['year'];
        const cccvv = req.body.cvv || req.body['cvv'];

        if (!keyen || !ccnum || !ccmonth || !ccyear || !cccvv) {
            return res.json({
                success: false,
                error: 'Missing input data!'
            });
        }

        console.log(`[${ip}] - Post Adyen v5(Encrypted) - Data: ${ccnum}|${ccmonth}|${ccyear}|${cccvv}`);

        const encryptCardData = require('adyen-5.11.0');

        const encryptedData = await encryptCardData(ccnum, ccmonth, ccyear, cccvv, keyen);
        var brand = await AdyenCardType(ccnum)
        res.json({
            success: true,
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
