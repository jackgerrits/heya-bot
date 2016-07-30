var Handler = function(func){
    this.func = func;
    this.next = null;
}

Handler.prototype = {
    execute : function(context, entities, callback){
        func(context, entities, function(resultPair){
            if(resultPair.execStatus == "FAILURE" || resultPair.execStatus == "SUCCESS"){
                callback(resultPair);
            } else if (this.next === null){
                callback({execStatus : this.RESULTS.CANT_HANDLE, context : context});
            } else {
                this.next.execute(context, entities, callback);
            }
        });
    },
    setNext: function(handler){
        this.next = handler;
    }
}


function intentHandler() {
    var head = null;

    this.RESULTS = {
        SUCCESS : "SUCCESS",
        FAILURE : "FAILURE",
        CANT_HANDLE : "CANT_HANDLE"
    };

    // { intent: [ { confidence: 0.9688451558848296, value: 'greeting' } ] }
    this.findMostLikelyEntity = function(entities, name){
        var possibilities = entities[name];
        var bestConfidence = 0;
        var bestValue = "";

        for(var i = 0; i < possibilities.length; i++){
            if(possibilities[i].confidence > bestConfidence){
                bestConfidence = possibilities[i].confidence;
                bestValue = possibilities[i].value;
            }
        }

        return bestValue;
    };

    // Handler must be a funtion that accepts context and entities
    this.registerHandler = function(func){
        if(head === null){
            head = new Handler(func);
        } else {
            var next = new Handler(func);
            head.setNext(next);
            head = next;
        }
    };

    this.handleRequest = function(context, entities, callback) {
        if(head === null){
            callback({execStatus : this.RESULTS.CANT_HANDLE, context : context});
        } else {
            head.execute(context, entities, callback);
        }
    };

    return this;
}

// Holds an instantiated intentHandler to be used by the app
module.exports = intentHandler();
