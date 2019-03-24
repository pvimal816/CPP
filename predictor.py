# prints object in pritty form
from pprint import pprint
# mongodb drivers
from pymongo import MongoClient
# date handling
import datetime
# ML model persistence
from joblib import load
# ML price predictor
from sklearn import linear_model

# helper function
def copy(keys, obj):
    ret = {}
    for key in keys:
        ret[key] = obj[key]
    return ret

# connect to db table

mongoURL = "mongodb://localhost:27017/"
dbNm = "CommodityPrices"
tableNm = "prices"

dbClient = MongoClient(mongoURL)
commodityDb = dbClient[dbNm]
priceTbl = commodityDb[tableNm]

# find record whose price haven't yet predicted
latestDate = priceTbl.find({"modelPrice": {"$exists": True}}).sort([("date", -1)]).limit(1)[0]["date"]
latestDateTime = datetime.date(*map(int, latestDate.split("/")))
unpredicted = priceTbl.find({"date": latestDate, "modelPrice": {"$exists": True}})
# load already trained models
model = []
for i in range(1, 31):
    model.append(load('predictor_models/potatoes/model_' + str(i) + '.joblib'))

#loop through all different commodity and markets
for i in unpredicted:
    #predict prices for 1 to 30 days in future
    for j in range(1, 31):
        predictedPrice =  model[j-1].predict([[latestDateTime.day, latestDateTime.month, i["modelPrice"]]])[0]
        predictedPrice = int(round(predictedPrice))
        futureDate = latestDateTime + datetime.timedelta(days=j)
        
        # compose a new object to be stored
        newRecord = copy(["commodity", "market", "district"], i)
        newRecord["date"] =  "{0}/{1}/{2}".format(futureDate.year, futureDate.month, futureDate.day)
        
        #check whether record with these date is already available or not
        if(priceTbl.count_documents(newRecord) ==  0):
            #no record is there with matching atributes so insert new record
            newRecord["predictedPrice"] = predictedPrice
            priceTbl.insert_one(newRecord)
        else:
            #record with matching attributes is already present so update it
            priceTbl.update_one(newRecord, {"$set": {"predictedPrice": predictedPrice}})