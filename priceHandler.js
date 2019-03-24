var mogoose = require('mongoose');
var actualPrice = require('./models/prices');
var config = require('./config');

//Database connection
mogoose.connect(config.dbURL, {useNewUrlParser: true}).catch((reason) => {
    console.log(reason);
}).then(() => {
    console.log(config.mode === "Production" ? "" : "Database connected successfully.");
});

var priceHandler = function(req, res, next){
    // some dates used below
    if(!req.query.hasOwnProperty("dayCount") ||
        !req.query.hasOwnProperty("date") || 
        !req.query.hasOwnProperty("commodity") || 
        !req.query.hasOwnProperty("market")){
            res.json(config.error_codes.INVALID_API_REQUEST_PARAM);
            res.end();
    }
    
    var startDate = new Date(req.query.date);
    var offset = req.query.dayCount;
    var lastDate = addDate(startDate, offset);
    
    var query = objCopy(["date", "commodity", "market"], req.query);
    var result = [];
    actualPrice.find({
            date: {$gte: dateToString(startDate), $lt: dateToString(lastDate)},
            commodity: req.query.commodity,
            market: req.query.market
        }, (err1, result1)=>{
        if(err1){
            console.error(err);
            res.end();
            //handle error
        }else if(result1){
            res.json(filterArray(result1));            
            res.end();
        }else{
            res.json(config.error_codes.RECORD_NOT_FOUND);
            res.end();
        }
    });
};

function objCopy(keys, obj){
    let ret = {};
    keys.map( (key) => { if(obj.hasOwnProperty(key)) ret[key] = obj[key]; } );
    return ret;
}

function addDate(date, offset){
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + 
    (offset * 24 * 3600 * 1000));
}

function dateToString(date){
    return date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate();
}

function filterArray(obj){
    var ret = [];
    obj.map(
        (ele) => {
            ret.push(objCopy(["modelPrice", "predictedPrice", "date"], ele._doc));
        }
    );
    return ret;
}

module.exports = priceHandler;