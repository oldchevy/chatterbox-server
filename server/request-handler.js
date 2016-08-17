/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var ids = {'442007': true,
           '442008': true,
           '442009': true,
           '442010': true
          };

var randomIdGenerator = function() {
  var bool = true;
  while (bool) {
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    if (!ids[randomColor]) {
      bool = false;
      ids[randomColor] = true;
    }
  }
  return randomColor;
};

var chatData;


var requestHandler = function(request, response) {
  


  console.log('Serving request type ' + request.method + ' for url ' + request.url + ', headers:' + request.headers);


  var makeResponse = function(statusCode) {
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    var responseBody = {

      headers: response.headers,
      method: request.method,
      url: request.url,
      results: chatData

    };
    if (statusCode !== 404) {
      return responseBody;
    } 
    
  };

  var match;

  if (request.url === '/') {
    var data = fs.readFileSync('./client/index.html');
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(data);
    var chats = fs.readFileSync('./server/chats.txt');
    chatData = JSON.parse(chats) || [];
    response.end();
  }
  if (request.url === '/styles/styles.css') {
    var data = fs.readFileSync('./client/styles/styles.css');
    response.writeHead(200, {'Content-Type': 'text/css'});
    response.write(data);
    response.end();
  }
  if (request.url === '/bower_components/jquery/dist/jquery.js') {
    var data = fs.readFileSync('./client/bower_components/jquery/dist/jquery.js');
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    response.write(data);
    response.end();
  }
  if (request.url === '/bower_components/moment/moment.js') {
    var data = fs.readFileSync('./client/bower_components/moment/moment.js');
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    response.write(data);
    response.end();
  }
  if (request.url === '/scripts/app.js') {
    var data = fs.readFileSync('./client/scripts/app.js');
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    response.write(data);
    response.end();
  }


  if (request.url === '/classes/messages') {

    if (request.method.toUpperCase() === 'GET') {

      response.end(JSON.stringify(makeResponse(200)));

    } else if (request.method.toUpperCase() === 'POST') {

      var body = '';
      request.on('data', function(chunk) {
        body += chunk;
      }).on('end', function() {
        body = JSON.parse(body);
        body.createdAt = new Date();
        body.objectId = randomIdGenerator();
        chatData.unshift(body);
      });
      
      response.end(JSON.stringify(makeResponse(201)));
    
    } else if (request.method.toUpperCase() === 'OPTIONS') {
      makeResponse(204);
      response.end();
    }

  } else if (match = request.url.match(/\/classes\/rooms\/(.*)/)) {

    if (request.method.toUpperCase() === 'GET') {

      var body = makeResponse(200);
      body.results = chatData.filter(function(messageObj) {
        return messageObj.roomname === match[1];
      });
      response.end(JSON.stringify(body));
    } else {
      makeResponse(404);
      response.end();
    }

  } else {
    makeResponse(404);
    response.end();

    //Give a message, there's no data here!
  }
};

exports.requestHandler = requestHandler;
exports.chats = function(){ return chatData; };

  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  // The outgoing status.
  // var statusCode = 200;

  // See the note below about CORS headers.
  // var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'text/plain';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // response.end('Hello, World!');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
