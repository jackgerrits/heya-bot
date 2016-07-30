'use strict';

var registry = require("../intentHandler.js");

const ForecastIO = require('forecast-io');
const forecast = new ForecastIO('');

const cities = require("../cities.json");

var city = cities['Melbourne'];

if (city) {
  // Get weather forecast using Dark Sky API. Date is YYYY-MM-DD. All parameters
  // are string types.
  forecast
    .latitude(city.lat.toString())
    .longitude(city.lon.toString())
    .time('2016-07-31')
    .units('ca')
    .language('en')
    .exclude('minutely,hourly')
    .get()
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
}
else {
  console.log("NOT_FOUND");
}


module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

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
