"use strict";

const axios = require('axios');

module.exports = async function(req, res) {
    try {
        const response = await axios.get("https://www.doogal.co.uk/CreateRandomAddress/");
        const body = response.data;

        const data = body.split(",");
        data[1] = data[1].trim();
        data[2] = data[2].trim();

        res.json({
            address1: data[0],
            address2: "",
            city: data[1],
            state: "England",
            postalCode: data[2],
            coordinates: {
                lat: data[3],
                lng: data[4]
            }
        });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
}
