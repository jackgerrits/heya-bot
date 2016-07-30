var Handler = function(func){
    this.func = func;
    this.next = null;
}

Handler.prototype = {
    execute : function(context, entities, callback){
        this.func(context, entities, function(resultPair){
            console.log(this.next);
            if(resultPair.execStatus == "FAILURE" || resultPair.execStatus == "SUCCESS"){
                callback(resultPair);
            } else if (this.next == null){
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
    this.firstEntityValue = function(entities, entity) {
      var val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value
      ;
      if (!val) {
        return null;
      }
      return typeof val === 'object' ? val.value : val;
    };

    // Handler must be a funtion that accepts context and entities
    this.registerHandler = function(func){
        if(head === null){
            head = new Handler(func);
            console.log("registered head")
        } else {
            var next = new Handler(func);
            head.setNext(next);
            head = next;
        }
    };

    this.handleRequest = function(context, entities, callback) {
        if(head == null){
            callback({execStatus : this.RESULTS.CANT_HANDLE, context : context});
        } else {
            console.log("Handling chain")
            console.log(context);
            console.log(entities);
            console.log(callback);
            head.execute(context, entities, callback);
        }
    };

    return this;
}

// Holds an instantiated intentHandler to be used by the app
module.exports = intentHandler();
