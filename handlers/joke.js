var request = require('request');

var jokeUrl = "http://tambal.azurewebsites.net/joke/random";

module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    request(jokeUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            returnObject.execStatus = "SUCCESS";
            returnObject.context.result = JSON.parse(body).joke;

            callback(returnObject);
        }
    });
};
