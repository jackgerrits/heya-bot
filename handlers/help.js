module.exports = function(context, entities, callback){
    var returnObject = {execStatus : "CANT_HANDLE", context : context};

    returnObject.execStatus = "SUCCESS";
    returnObject.context.result = "You can ask me about weather, pokemon, jokes and I can remind you about things.";

    callback(returnObject);
};
