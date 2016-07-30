var fetch = require('node-fetch');

var fbMessage = function(recipientId, text) {
    var body = JSON.stringify({
        recipient: { recipientId },
        message: { text },
    });
    var qs = 'access_token=' + encodeURIComponent(process.env.PAGE_ACCESS_TOKEN);
    return fetch('https://graph.facebook.com/me/messages?' + qs, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
    })
    .then(function(rsp) {return rsp.json()})
    .then(function(json) {
        if (json.error && json.error.message) {
            throw new Error(json.error.message);
        }
        return json;
    });
};

module.exports = fbMessage;
