var express = require('express');
var config = require('./config');
var priceHandler = require('./priceHandler');

var app = express();
app.listen(config.port, ()=>{
    console.log("[-] Server started on port " + config.port + ".");
});

/*
To Do: Create API that takes 
        starting_date date, commodity_name,
        no_of_days of which price is needed starting from given starting date,
        district,
        market,

        No. of things to be taken care of
        -> return record till day min((starting_date + 30 days), last record avilable) 
*/

//?commodity=potatoes&date=27-07-17&district=xyz&market=abc
app.get('/prices',(req, res, next) => {
    let date = new Date(req.query.date);
    if(date.valueOf() - Date.now()<= config.maxDayToPredict * 24 * 3600000){
        next();
    }else{
        //interval is larger than days configured.
        res.json({error: "wrong date format(use yyyy/mm/dd format) or interval is larger than days configured."});
    }
});

app.get('/districtList', (req,res,next)=>{
    res.json(config.interestedDistricts);
    res.end();
});

app.get('/commodityList', (req, res, next)=>{
    res.json(config.interestedCommodities);
    res.end();
});

app.get('/prices', priceHandler);

app.get('*',(req, res, next)=>{
    res.end("404 Page not found.");
});