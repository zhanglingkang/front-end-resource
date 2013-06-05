var utils = require("util"),
	EventEmitter = require("events").EventEmitter,
	Server = function  () {
		console.log("init");
	};
//node的基础
utils.inherits(Server,EventEmitter);

var ser = new Server();

ser.on("connect",function(evt){
	var argu = [].slice.call(arguments);
	console.log(argu);
});

ser.emit("connect",{id:3,name:"joel"});