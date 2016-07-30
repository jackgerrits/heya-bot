function intentHandler() {
    var handlers = [];

    this.RESULTS = {
        SUCCESS : "SUCCESS",
        FAILURE : "FAILURE",
        CANT_HANDLE : "CANT_HANDLE"
    }

    // Handler must be a funtion that accepts context and entities
    this.registerHandler = function(handler){
        handlers.push(handler);
    }

    this.handleRequest = function(context, entities) {
        var result = this.RESULTS.CANT_HANDLE;
        console.log(context);
        console.log(entities);

        for(var i = 0; i < handlers.length; ++i){
            result = handlers[i](context, entities);
            if(result == this.RESULTS.FAILURE || result == this.RESULTS.SUCCESS){
                return result;
            }
        }
        // If this location is reached, there is no handler for this query
        return this.RESULTS.CANT_HANDLE;
    }

    return this;
}

// entities.intent == "pokemon"

// var exampleResObj {
//     context : originalContextParameterThatWasPassedInWithTheResultsChangedInTheObject,
//     result: "SUCCESS"/"FAILURE"/"CANT_HANDLE"
// }
// /*
//     the handler must return an object of the above format

// */

// Holds an instantiated intentHandler to be used by the app
module.exports = intentHandler();
