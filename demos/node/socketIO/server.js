var http = require("http"),
	io= require("socket.io"),
	fs = require('fs');

// var socketFile = fs.readFileSync("client.html");//default utf8
// server = http.createServer();
// server.listen(8080);
// server.on("request",function(req,res){
// 	res.writeHead(200,{'content-type':'text/html'});
// 	res.end(socketFile);//静态服务器。。。
// });

//  var socket = io.listen(server);
//  socket.on("connection",function(client){
//  	console.log('client connected!');
//  	client.send('welcome client ' + client.sessionId);
//  });
//  socket.on("")

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/client.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});