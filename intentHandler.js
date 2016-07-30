function intentHandler() {
    var handlers = {};

    this.RESULTS = {
        SUCCESS : "SUCCESS",
        FAILURE : "FAILURE",
        CANT_HANDLE : "CANT_HANDLE"
    };

    // { intent: [ { confidence: 0.9688451558848296, value: 'greeting' } ] }
    this.firstEntityValue = function(entities, entity) {
        var val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value;
        if (!val) {
              return null;
        }
        return typeof val === 'object' ? val.value : val;
    };

    // Handler must be a funtion that accepts context and entities
    this.registerHandler = function(name, func){
        handlers[name] = func;
    };

    this.handleRequest = function(context, entities, callback) {
        var intentName = this.firstEntityValue(entities, "intent");
        if(intentName && handlers.hasOwnProperty(intentName)){
            handlers[intentName](context, entities, callback);
        } else {
            callback({execStatus : this.RESULTS.CANT_HANDLE, context : context});
        }
    };

    return this;
}

// Holds an instantiated intentHandler to be used by the app
module.exports = intentHandler();
