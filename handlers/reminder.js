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

var responses = ["I'll remind you!", "Leave it with me", "I got you"];

function reminder(id, message){
    return function(){
        fbMessage(id, message).catch(console.error);;
    }
}

module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    var reminderTime = registry.firstEntityValue(entities, "datetime");
    var reminderString = registry.firstEntityValue(entities, "reminder");

    // If it was omitted from the request, use a default message.
    if(!reminderString) {
        reminderString = "Reminding you!";
    } else {
        reminderString = "Don't forget to" + reminderString;
    }


    var now = moment();
    var soon = moment(reminderTime);
    var secondsDiff = soon.diff(now, 'seconds');

    setTimeout(reminder(context.fbid, "Don't forget to " + reminderString), secondsDiff * 1000);

    returnObject.execStatus = "SUCCESS";
    returnObject.context.result = responses[getRandomInt(0, responses.length - 1)];

    callback(returnObject);
};
