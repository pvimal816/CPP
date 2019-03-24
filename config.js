function addErrCode(obj, code, discription){
    obj[discription] = {
        "ERROR_CODE" : code,
        "ERROR_DISCRIPTION" : discription,
    };
}
var err = {};
//occurs when no record from database matches with conditions.
addErrCode(err, 4000, "RECORD_NOT_FOUND");
addErrCode(err, 4001, "INVALID_API_REQUEST_PARAM");


module.exports = {
    //database configuration
    "dbURL": "mongodb://localhost:27017/CommodityPrices",
    "apiURL": "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001160b6b7cbe2e41757c5bbea61b599a720&format=json&limit=10000",
    //application configuration
    "interestedDistricts": ["ahmedabad", "sabarkantha", "vadodara(baroda)"],
    "interestedCommodities": ["cotton", "castor seed", "cummin seed(jeera)", "paddy(dhan)", "wheat", "Brinjal", "Tomato", "Potatoes"],
    //server configuration
    "port": 3000,
    "error_codes": err,
    "mode": "Developement"
};