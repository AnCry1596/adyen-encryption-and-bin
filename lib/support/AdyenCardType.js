const cardPatterns = {
    amex: /^3[47][0-9]{13}$/,
    diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    discover: /^6(?:011|5[0-9][0-9])[0-9]{12,15}$/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
    mc: /^5[1-5][0-9]{2}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/,
    cup: /^(6[27][0-9]{14}|81[0-9]{14,17})$/,
    visa: /^(?:4[0-9]{12})(?:[0-9]{3,6})?$/,
    elo: /^(4[0-1][0-9]{2}|4[2-9][0-9]{2}|50[0-9]{2})[0-9]{12,15}$/,
    krlc: /^(3175|4171|4504|4526|4532)[0-9]{12,15}$/
};

module.exports = async function getCardScheme(cardNumber) {
    return new Promise((resolve) => {
        for (const [scheme, pattern] of Object.entries(cardPatterns)) {
            if (pattern.test(cardNumber)) {
                resolve(scheme); // Return the matching card scheme
            }
        }
        resolve(null); // Return null if no match found
    });
}
