var mongoose = require('mongoose');

const price = {
    commodity: String,
    modelPrice: Number,
    minPrice: Number,
    maxPrice: Number,
    predictedPrice: Number,
    district: String,
    market: String,
    date: String
};

module.exports = mongoose.model('price', price);