var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var intentHandler = require("./intentHandler.js");
var Wit = require('node-wit').Wit;
var log = require('node-wit').log;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


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

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
var sessions = {};

var findOrCreateSession = function(fbid) {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(function(k){
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

// Our bot actions
var actions = {
  send(sessionId, text) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    var recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      return sendMessage(recipientId, text)
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
      return Promise.resolve()
    }
  },
  handleIntent({context, entities}) {
    return new Promise(function(resolve, reject) {
      var resultPair = intentHandler.handleIntent(context, entities);
      if(resultPair.result == intentHandler.RESULTS.FAILURE){
        console.error("There was an error when handling intent: " + entities.intent);
        resultPair.context.result = "No functions handled this question.";
      }
      return resolve(resultPair.context);
    });
  },
};

// Setting up our bot
var wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// handler receiving messages
app.post('/webhook', function (req, res) {
    // Parse the Messenger payload
  // See the Webhook reference
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference
  var data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        if (event.message) {
          // Yay! We got a new message!
          // We retrieve the Facebook user ID of the sender
          var sender = event.sender.id;

          // We retrieve the user's current session, or create one if it doesn't exist
          // This is needed for our bot to figure out the conversation history
          var sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          var {text, attachments} = event.message;

          if (attachments) {
            // We received an attachment
            // Let's reply with an automatic message
            sendMessage(sender, 'Sorry I can only process text messages for now.')
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
              //   delete sessions[sessionId];
              // }

              // Updating the user's current session state
              sessions[sessionId].context = context;
            })
            .catch((err) => {
              console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
          }
        } else {
          console.log('received event', JSON.stringify(event));
        }
      });
    });
  }
  res.sendStatus(200);
});


app.listen((process.env.PORT || 3000));
