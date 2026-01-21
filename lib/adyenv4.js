"use strict";

const jose = require('node-jose');
const AdyenCardType = require('./support/AdyenCardType');

async function parseKey(t) {
    // These two functions can probably be replaced with something cleaner
    // to: URL-safe base64 encode?
    // ro: hex decode
    function to(e) {
        return function(e) {
            var t = e;
            for (var r = [], n = 0; n < t.length; n += 32768)
                r.push(String.fromCharCode.apply(null, t.subarray(n, n + 32768)));
            return btoa(r.join(""))
        }(e).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
    }

    function ro(e) {
        if (!e)
            return new Uint8Array(0);
        e.length % 2 == 1 && (e = "0" + e);
        for (var t = e.length / 2, r = new Uint8Array(t), n = 0; n < t; n++)
            r[n] = parseInt(e.substr(2 * n, 2), 16);
        return r
    }

    const r = t.split("|"); // Key parts
    const n = r[0]; // Exponent
    const o = r[1]; // RSA public key
    const i = ro(n);
    const a = ro(o);
    const c = to(i);
    const s = to(a);

    return jose.JWK.asKey({
        kty: "RSA",
        kid: "asf-key", // kid used in Adyen script
        e: c,
        n: s
    });
}

async function encrypt(pubKey, fieldName, value, generationTime, referrer) {
    // ISO string without milliseconds
    const formattedGenerationTime = generationTime.toISOString().split('.')[0]+"Z";

    let data;
    switch (fieldName) {
        case "number":
            data = {
                "number": value,
                "activate": "3",
                "deactivate": "1",
                "generationtime": formattedGenerationTime,
                "numberBind": "1",
                "numberFieldBlurCount": "1",
                "numberFieldClickCount": "1",
                "numberFieldFocusCount": "3",
                "numberFieldKeyCount": "16",
                "numberFieldLog": "fo@44070,cl@44071,KN@44082,fo@44324,cl@44325,cl@44333,KN@44346,KN@44347,KN@44348,KN@44350,KN@44351,KN@44353,KN@44354,KN@44355,KN@44356,KN@44358,fo@44431,cl@44432,KN@44434,KN@44436,KN@44438,KN@44440,KN@44440",
                "numberFieldPasteCount": "1",
                "referrer": referrer
            };
            break;

        case "expiryMonth":
            data = {
                "expiryMonth": value,
                "generationtime": formattedGenerationTime
            };
            break;

        case "expiryYear":
            data = {
                "expiryYear": value,
                "generationtime": formattedGenerationTime
            };
            break;

        case "cvc":
            data = {
                "activate": "4",
                "cvc": value,
                "cvcBind": "1",
                "cvcFieldClickCount": "4",
                "cvcFieldFocusCount": "4",
                "cvcFieldKeyCount": "6",
                "cvcFieldChangeCount": "1",
                "cvcFieldBlurCount": "2",
                "deactivate": "2",
                "cvcFieldLog": "fo@122,cl@123,KN@136,KN@138,KN@140,fo@11204,cl@11205,ch@11221,bl@11221,fo@33384,bl@33384,fo@50318,cl@50319,cl@50321,KN@50334,KN@50336,KN@50336",
                "generationtime": formattedGenerationTime,
                "referrer": referrer
            };
            break;

        default:
            throw new Error("Invalid fieldName " + fieldName);
    }

    return jose.JWE.createEncrypt(
        {
            format: "compact",
            contentAlg: "A256CBC-HS512",
            fields: {
                alg: "RSA-OAEP",
                enc: "A256CBC-HS512",
                version: "1" // additional field added by Adyen
            }
        },
        {key: pubKey, reference: false} // don't include "kid" field in header
    )
        .update(JSON.stringify(data))
        .final();
}

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

        console.log(`[${ip}] - Post Adyen v4(Encrypted) - Data: ${ccnum}|${ccmonth}|${ccyear}|${cccvv}`);     
        
        const key = await parseKey(keyen);
        const generationTime = new Date();
        const [encryptedCardNumber, encryptedExpiryMonth, encryptedExpiryYear, encryptedSecurityCode] = await Promise.all([
            encrypt(key, "number", ccnum, generationTime, referrer),
            encrypt(key, "expiryMonth", ccmonth, generationTime, referrer),
            encrypt(key, "expiryYear", ccyear, generationTime, referrer),
            encrypt(key, "cvc", cccvv, generationTime, referrer)
        ]);
        var brand = await AdyenCardType(ccnum)
        res.json({
            encryptedCardNumber,
            encryptedExpiryMonth,
            encryptedExpiryYear,
            encryptedSecurityCode,
            brand,
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};
