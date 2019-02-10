var mogoose = require('mongoose');
var actualPrice = require('./models/prices');
var config = require('./config');

//Database connection
mogoose.connect(config.dbURL, {useNewUrlParser: true}).catch((reason) => {
    console.log(reason);
}).then(() => {
    console.log("Database connected successfully.");
});

var priceHandler = function(req, res, next){
    // some dates used below
    var date = new Date(req.query.date);
    var dateStr = date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate();

    actualPrice.findOne({
            date: dateStr,
            commodity: req.query.commodity, 
            district: req.query.district, 
            market: req.query.market
        }, (err1, result1)=>{
        if(err1){
            console.error(err);
            res.end();
            //handle error
        }else if(result1){
            res.json(result1);
            res.end();
        }else{
            res.json(config.error_codes.RECORD_NOT_FOUND);
            res.end();
        }
    });
};
module.exports = priceHandler;