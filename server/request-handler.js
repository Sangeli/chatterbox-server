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



var allMessages = [];
var endpoints = new Set();
endpoints.add('/classes/messages');
endpoints.add('/classes/room');



var fakeMessage = {
  username: 'alec',
  text: 'i am text',
  roomname: 'lobby'
};

//allMessages.push(fakeMessage);

var first = true;
var requestHandler = function(request, response) {

  if(first) {
    console.log('request', request);
    fs.readFile('server/index.html', function(err, data){
      console.log('err', err);
      console.log('read', data);
      response.writeHead(200, {'Content-Type': 'text/html', 'Content-Length':data.length});
      //response.write(data);
      response.end(data);
    });
  } else {
    return;
  }
  first = false;

  //return;

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
  console.log('Serving request type ' + request.method + ' for url ' + request.url);


  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  //headers['Content-Type'] = 'application/json';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.


  var responseBody = {
    headers: headers,
    method: request.method,
    url: request.url,
  };

  var statusCode;

  var onBadUrl = function(data) {
    statusCode = 404;
    console.log('bad url');
    responseBody.results = data;
  };

  var onPost = function(data) {
    console.log('post', data);
    //data = Buffer.concat(data).toString();
    data = JSON.parse(data);

    statusCode = 201;
    allMessages.push(data);
    responseBody.results = data;
  };

  var onGet = function(data) {
    statusCode = 200;
    responseBody.results = allMessages;
    console.log('allMessages', responseBody.results);
  };

  var onOptions = function(data) {

    statusCode = 200;
    response.writeHead(statusCode, headers);
  };


  request.on('error', function(err) {
    console.log('got request error');
    console.log(err);
  });


  var data = [];

  request.on('data', function(chunk) {
    console.log('chunk', chunk);
    if(chunk !== undefined) {
      data.push(chunk);
    }
  });


  request.on('end', function() {

    //console.log(data, "data before buffer");
    //console.log('response', response);



    if(!endpoints.has(request.url)) {
      onBadUrl(data);
    } else if (request.method === 'POST') {
      onPost(data);
    } else if(request.method === 'GET') {
      onGet(data);
    } else if(request.method === 'OPTIONS') {
      onOptions(data);
    } else {
      console.log('unexpected route');
      console.log(request.method);
      console.log(request.url);
    }
    
    //response.setHeader('Content-Type', 'application/json');
    response.writeHead(statusCode, headers);



    response.end(JSON.stringify(responseBody));


  });

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  /*
  var responseBody = {
    headers: headers,
    method: request.method,
    url: request.url,
    body: data
  };

  response.write(JSON.stringify(responseBody));
  console.log('bufferedData');
  console.log(bufferedData);
  */



};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
module.exports.requestHandler = requestHandler;

