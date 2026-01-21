"use strict";
const realUSAddress = require('./randomaddress/realusaddress');
const realUKAddress = require('./randomaddress/realukaddress');
const realCAAddress = require('./randomaddress/realcaaddress');
const realITAddress = require('./randomaddress/realitaddress');

module.exports = async function(req, res){
    var country = req.query.country || req.params.COUNTRY
    if (!country){
        res.json({
        success: false,
        error: "Invalid Country",
        avaiable: {
            UnitedState: 'us',
            UnitedKingdom: 'uk',
            Canada: 'ca',
            Italy: 'it'
        }
    });
}
        switch (country.toLowerCase()) {
            case 'us':
                await realUSAddress(req, res);
                break;

            case 'uk':
                await realUKAddress(req, res);
                break;
            
            case 'ca':
                await realCAAddress(req, res);
                break;

            case 'it':
                await realITAddress(req, res);
                break;

            default:
                res.json({
                    success: false,
                    error: "Invalid Country",
                    avaiable: {
                        UnitedState: 'us',
                        UnitedKingdom: 'uk',
                        Canada: 'ca',
                        Italy: 'it'
                    }
                });
                break;
    }
}