/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * Thanks! => http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var responses = ["No problem!", "All good", "Don't worry about it"];

module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    returnObject.execStatus = "SUCCESS";
    returnObject.context.result = responses[getRandomInt(0, responses.length - 1)];

    callback(returnObject);
};
