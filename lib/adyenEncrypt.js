'use strict';

const fake = require('fake-generator');
const adyenEncrypt = require('node-adyen-encrypt');
const AdyenCardType = require('./support/AdyenCardType');

module.exports = async function(req, res) {
  try {
    const ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress || req.clientIp;
    const key = req.body.key || req.body['key'] || req.body.apikey;
    const version = req.body.ver || req.body['ver'] || req.body.version;
    const ccnum = req.body.cc || req.body['cc'];
    const ccmonth = req.body.month || req.body['month'] || req.body.mm;
    const ccyear = req.body.year || req.body['year'] || req.body.yy;
    const cccvv = req.body.cvv || req.body['cvv'];

    if (!key || !version || !ccnum || !ccmonth || !ccyear) {
      return res.json({
        success: false,
        error: 'Missing input data!'
      });
    }

    console.log(`[${ip}] - Post Adyen v0.1.${version} (Encrypted) - Data: ${ccnum}|${ccmonth}|${ccyear}|${cccvv}`);

    const holderName = fake.getFakeName();

    const adyen = adyenEncrypt(version);
    const options = {};
    const cseInstance = adyen.createEncryption(key, options);
    const generationTime = new Date().toISOString();

    const encryptedCardNumber = cseInstance.encrypt({
      number: ccnum,
      generationtime: generationTime
    });

    const encryptedExpiryMonth = cseInstance.encrypt({
      expiryMonth: ccmonth,
      generationtime: generationTime
    });

    const encryptedExpiryYear = cseInstance.encrypt({
      expiryYear: ccyear,
      generationtime: generationTime
    });

    const encryptedSecurityCode = cseInstance.encrypt({
      cvc: cccvv,
      generationtime: generationTime
    });

    const encryptedData = cseInstance.encrypt({
      number: ccnum,
      cvc: cccvv,
      holderName: holderName,
      expiryMonth: ccmonth,
      expiryYear: ccyear,
      generationtime: generationTime
    })
    
    var brand = await AdyenCardType(ccnum)

    return res.json({
      success: true,
      holderName,
      encryptedCardNumber,
      encryptedExpiryMonth,
      encryptedExpiryYear,
      encryptedSecurityCode,
      encryptedData,
      brand
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};
