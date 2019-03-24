var express = require('express');
var config = require('./config');
var priceHandler = require('./priceHandler');

var app = express();
app.listen(config.port, ()=>{
    console.log("[-] Server started on port " + config.port + ".");
});

/*  ex
*   API: /Prices?&date=2019/03/14&commodity=Cotton&market=Modasa&dayCount=100
*/

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