var registry = require("../intentHandler.js");
var fbMessage = require("../fbMessage.js");
var moment = require('moment');

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * Thanks! => http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var responses = ["I'll remind you!", "Leave it with me"];

function reminder(id, message){
    return function(){
        fbMessage(id, message).catch(console.error);;
    }
}

module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    console.log(entities);
    var reminderTime = entities.datetime;
    var reminderString = entities.reminder;

    console.log(reminderTime);
    console.log(reminderString);

    returnObject.execStatus = "SUCCESS";
    returnObject.context.result = responses[getRandomInt(0, responses.length - 1)];

    callback(returnObject);
};
