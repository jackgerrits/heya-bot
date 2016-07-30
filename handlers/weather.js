var registry = require("../intentHandler.js");

var ForecastIO = require('forecast-io');
var forecast = new ForecastIO(process.env.DARK_SKY_KEY);

var cities = require("../cities.json");

function round_1dp(number) {
    return Math.round(number*10)/10;
}

// var city = cities['Melbourne']; // get lat-lon entry for city
// forecast
//   .latitude(city.lat.toString())
//   .longitude(city.lon.toString())
//   .units('ca')
//   .language('en')
//   .get()
//   .then(res => {
//     var result = JSON.parse(res);
//     console.log("There's a " + result.currently.
//       precipProbability.toString() + "% chance of rain.");
//     console.log("It's " + result.currently.summary.toLowerCase() + " and " +
//       round_1dp(result.currently.temperature).toString() + "°C outside.");
//   })
//   .catch(err => {
//     console.log(err)
//   })

module.exports.weather_rain = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    var city = cities['Melbourne']; // get lat-lon entry for city
    if (city) {
        // Get weather forecast using Dark Sky API. Date is YYYY-MM-DD.
        // All parameters are string types.
        forecast
            .latitude(city.lat.toString())
            .longitude(city.lon.toString())
            .units('ca')
            .language('en')
            .get()
            .then(res => {
                var result = JSON.parse(res);

                returnObject.execStatus = "SUCCESS";
                returnObject.context.result = "There's a " + result.currently.
                    precipProbability.toString() + "% chance of rain.";
                callback(returnObject);
            })
            .catch(err => {
                console.log(err)
            })
    }
    else {
        console.log("NOT_FOUND");
    }
}

module.exports.weather_temperature = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    var city = cities['Melbourne']; // get lat-lon entry for city
    if (city) {
        // Get weather forecast using Dark Sky API. Date is YYYY-MM-DD. All parameters
        // are string types.
        forecast
            .latitude(city.lat.toString())
            .longitude(city.lon.toString())
            .units('ca')
            .language('en')
            .get()
            .then(res => {
                var result = JSON.parse(res);

                returnObject.execStatus = "SUCCESS";
                returnObject.context.result = "It's " + result.currently.summary.
                    toLowerCase() + " and " + round_1dp(result.currently.temperature).
                        toString() + "°C outside.";
                callback(returnObject);
            })
            .catch(err => {
                console.log(err)
            })
    }
    else {
        console.log("NOT_FOUND");
    }
}
