"use strict";

module.exports = async function(req, res){
    const addresses = require('./addressdata/addresses-it-all.json').addresses
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
    res.json(randomAddress)
}