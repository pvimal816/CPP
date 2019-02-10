var mogoose = require('mongoose');
var request = require('request');
var actualPrice = require('./models/prices');
var config = require('./config');
var {exec} = require('child_process');

// counter to keep track of number of inserted objects
var count = 0;
var priceData;

//Database connection
mogoose.connect(config.dbURL, {useNewUrlParser: true}).catch((reason) => {
    console.log(reason);
}).then(() => {
    console.log("Database connected successfully.");
});

var fetchAndFill = function(){
    //API request
    console.log("Fetching data...");
    request(config.apiURL, {accept: "application/json"}, (error, response, body)=>{
        if(error){
            console.error("Error while fetching data from api. " + error);
            return;
        }
        console.log("Data fetched with status code " +  
                    (response && response.statusCode.toString().trim()) + ".");
        
        priceData = JSON.parse(body);
        //filtering data relevant to non-interested markets and commodities.
        priceData = priceData && priceData.records && priceData.records.filter((value) => {
            return value.district && 
            value.commodity &&
            config.interestedDistricts.includes(value.district.toLowerCase()) &&
            config.interestedCommodities.includes(value.commodity.toLowerCase());
        });


        console.log("Total ", priceData.length , " records fetched.");
        
        if(priceData.length === 0){
            mogoose.disconnect().then(()=>{
                console.log("Database disconnected.");
            });
        }

        //saving each record in pricedata array to DB.
        priceData.map(save);
    });
};

//helper functions

//save record into db.
function save(record){
    let rDateString = record.arrival_date.split('/');
    let rDate = new Date(parseInt(rDateString[2]), 
                        parseInt(rDateString[1])-1,
                        parseInt(rDateString[0]));
    let actualPriceRecord = new actualPrice({
        commodity: record.commodity,
        modelPrice: Number.parseInt(record.modal_price),
        minPrice: Number.parseInt(record.min_price),
        maxPrice: Number.parseInt(record.max_price),
        predictedPrice: -1,
        market: record.market,
        district: record.district,
        date: rDate.getFullYear() + "/" + (rDate.getMonth() + 1) + "/" + rDate.getDate()
    });

    let query = objCopy(["commodity", "market", "district", "date"], actualPriceRecord);
    
    actualPrice.countDocuments(query, (err, docCount) => {
        if (err) {
            printErr(err);
        }
        else if(docCount == 0){
            //counting how many records have been saved.
            //after last record being saved exit from process.
            actualPriceRecord.save().catch(printErr).then(cleanUp);
        } else {
            let changes = objCopy(["modelPrice", "minPrice", "maxPrice"], actualPriceRecord);
            actualPrice.updateOne(query, changes).catch(printErr).then(cleanUp);
        }
    });
}

function printErr(err){
    throw Error(err);
}

//disconnects db connection then invoke python script to forecast prices
function cleanUp(){
    if (++count >= priceData.length) {
        console.log("All records have been saved to DB.");
        mogoose.disconnect().then(() => {
            console.log("Database disconnected.");
            //To Do: invoke python script.
            exec('python predictor.py', (err, stdout) => {
                if (err) {
                    printErr(err);
                } else {
                    console.log(stdout);
                }
            });
        });
    }
}

//copies elements from obj whose key is contained in keys.
function objCopy(keys, obj){
    let ret = {};
    keys.map( (key) => { ret[key] = obj[key]; } );
    return ret;
}

fetchAndFill();