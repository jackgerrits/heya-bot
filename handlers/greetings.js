var registry = require("../intentHandler.js");

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * Thanks! => http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var responses = ["Hey boss 👽", "Yeah man?"];

module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    console.log("most likely" + registry.findMostLikelyEntity(entities, "intent"));
    if(registry.firstEntityValue(entities, "intent") == "greeting") {
        returnObject.execStatus = "SUCCESS";
        returnObject.context.result = responses[getRandomInt(0, responses.length - 1)];
    }

    callback(returnObject);
;}
