// Enhanced phone formatting
function formatPhone(phone, format = 'random') {
    if (!phone || phone.length < 10) return phone;
    
    const formats = {
        parentheses: `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`,
        dashes: `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`,
        dots: `${phone.slice(0, 3)}.${phone.slice(3, 6)}.${phone.slice(6)}`,
        spaces: `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`,
        plain: phone,
        international: `+1 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
    };
    
    if (format === 'random') {
        const formatKeys = Object.keys(formats);
        format = formatKeys[Math.floor(Math.random() * formatKeys.length)];
    }
    
    return formats[format] || formats.parentheses;
}
module.exports = formatPhone;