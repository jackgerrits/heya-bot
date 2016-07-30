'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var Wit = require('node-wit').Wit;
var log = require('node-wit').log;
var fetch = require('node-fetch');

// Register intent handlers!
var intentHandlerClass = require("./intentHandler.js");
var greetings = require("./handlers/greetings.js");
var pokemon = require("./handlers/pokego.js");
var weather = require("./handlers/weather.js");

intentHandlerClass.registerHandler("greeting", greetings);
intentHandlerClass.registerHandler("pokemon", pokemon);
intentHandlerClass.registerHandler("weather_temperature", weather.weather_temperature);
intentHandlerClass.registerHandler("weather_rain", weather.weather_rain);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var errorMessages = ["I don't know what to do with that",
    "I bet Siri doesn't understand either",
    "Ask me later, I must learn more",
    "Sorry, I've got no idea what you just said",
    "I'm only young",
    "My creators didn't have the foresight to teach me that",
    "Not my fault, blame Ben, his crazy API calls and nested callbacks to the heat death of the universe"]

// Wit.ai parameters
var WIT_TOKEN = process.env.WIT_TOKEN;

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

var fbMessage = function(id, text) {
    console.log(id);
    var body = JSON.stringify({
        recipient: { id },
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

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
var sessions = {};

var findOrCreateSession = function(fbid) {
    var sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(function (k) {
        if (sessions[k].fbid === fbid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = { fbid: fbid, context: {} };
    }
    return sessionId;
};

// Our bot actions
var actions = {
    send: function({sessionId}, {text}) {
        // Our bot has something to say!
        // Let's retrieve the Facebook user whose session belongs to
        var recipientId = sessions[sessionId].fbid;
        if (recipientId) {
            // Yay, we found our recipient!
            // Let's forward our bot response to her.
            // We return a promise to let our bot know when we're done sending
            return fbMessage(recipientId, text)
            .then(() => null)
            .catch((err) => {
                console.error(
                    'Oops! An error occurred while forwarding the response to',
                    recipientId,
                    ':',
                    err.stack || err
                );
            });
        } else {
            console.error('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            return Promise.resolve();
        }
    },
    handleIntent: function({context, entities}) {
        return new Promise(function (resolve, reject) {
            var resultPair = intentHandlerClass.handleRequest(context, entities, function(resultPair){
                if (resultPair.execStatus == intentHandlerClass.RESULTS.CANT_HANDLE) {
                    resultPair.context.result = errorMessages[getRandomInt(0, errorMessages.length - 1)];
                }

                resolve(resultPair.context);
            });
        });
    }
};

// Setting up our bot
var wit = new Wit({
    accessToken: WIT_TOKEN,
    actions: actions,
    logger: new log.Logger(log.INFO)
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    // Parse the Messenger payload
    // See the Webhook reference
    // https://developers.facebook.com/docs/messenger-platform/webhook-reference
    const data = req.body;

    if (data.object === 'page') {
        data.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message) {
                    // Yay! We got a new message!
                    // We retrieve the Facebook user ID of the sender
                    const sender = event.sender.id;
                    // We retrieve the user's current session, or create one if it doesn't exist
                    // This is needed for our bot to figure out the conversation history
                    const sessionId = findOrCreateSession(sender);

                    // We retrieve the message content
                    const {text, attachments} = event.message;

                    if (attachments) {
                        // We received an attachment
                        // Let's reply with an automatic message
                        fbMessage(sender, 'Sorry I can only process text messages for now.')
                        .catch(console.error);
                    } else if (text) {
                        // We received a text message

                        // Let's forward the message to the Wit.ai Bot Engine
                        // This will run all actions until our bot has nothing left to do
                        wit.runActions(
                            sessionId, // the user's current session
                            text, // the user's message
                            sessions[sessionId].context // the user's current session state
                        ).then((context) => {
                            // Our bot did everything it has to do.
                            // Now it's waiting for further messages to proceed.
                            console.log('Waiting for next user messages');

                            // Based on the session state, you might want to reset the session.
                            // This depends heavily on the business logic of your bot.
                            // Example:
                            // if (context['done']) {
                            delete sessions[sessionId];
                            // }

                            // Updating the user's current session state
                            sessions[sessionId].context = context;
                        })
                        .catch((err) => {
                            console.error('Oops! Got an error from Wit: ', err.stack || err);
                        })
                    }
                } else {
                  // usually read receipt, ignore for now
                  console.log('received event', JSON.stringify(event));
                }
            });
        });
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
