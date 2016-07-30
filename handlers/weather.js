var registry = require("../intentHandler.js");

const ForecastIO = require('forecast-io')
const forecast = new ForecastIO('') // TODO: remove API key

/*
forecast
    .latitude('37.8267')
    .longitude('-122.423')
    .time('2016-01-28')
    .units('ca')
    .language('en')
    .exclude('minutely,daily')
    .get()
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    })
*/

module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    console.log("most likely" + registry.findMostLikelyEntity(entities, "intent"));
    if (registry.firstEntityValue(entities, "intent") == "weather_rain") {
        returnObject.execStatus = "SUCCESS";
        returnObject.context.result = "Will it rain? Find out soon!";
    }
    else if (registry.firstEntityValue(entities, "intent") == "weather_temperature") {
      returnObject.execStatus = "SUCCESS";
      returnObject.context.result = "How hot will it be? Find out soon!";
    }

    callback(returnObject);
}
