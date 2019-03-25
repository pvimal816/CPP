var mogoose = require('mongoose');
var express = require('express');
var config = require('./config');
var priceHandler = require('./priceHandler');
var priceTbl = require('./models/prices');

mogoose.connect(config.dbURL, {useNewUrlParser: true}).catch((reason) => {
    console.log(reason);
});

var app = express();
app.listen(config.port, ()=>{
    console.log("[-] Server started on port " + config.port + ".");
});

/*  ex
*   API: /Prices?&date=2019/03/14&commodity=Cotton&market=Modasa&dayCount=100
*/

app.get('/marketList', (req,res,next)=>{
    priceTbl.aggregate([{"$group": {_id: "$market"}}], (err, result) => {
        if(err) {
            console.log(err);
            res.end("Error in /marketList router.");
        } else {
            var result1 = [];
            result.map((record) => { result1.push(record._id);});
            res.json(result1);
            res.end();
        }
    });
});

app.get('/stateList', (req, res, next)=>{
    res.json(config.states);
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