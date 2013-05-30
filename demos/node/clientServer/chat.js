var net = require("net"),
	server = net.createServer(),
	clientList = [];
server.listen(9000);
server.on("connection",function(client){
	
	client.name = client.remoteAddress + " : " + client.remotePort;
	client.write("hi" + client.name + "!\n");
	console.log(client.name + " added!");
	clientList.push(client);
	
	client.on("data",function(data){
		broadcast(client,data);
	});
});
server.on("end",function(client){
	clientList.splice(clientList.indexOf(client),1);
});
server.on("error",function(error){
	console.log(erroer);
});

function broadcast(client,data){
	clientList.forEach(function(eachClient){
		if(eachClient.writable){
			if(client == eachClient){
				eachClient.write("me -> " + data);
			}else{
				eachClient.write(client.name + " -> " + data);
			}
		}
		
	});
}

/*激活启用Windows Vista中上的Telnet功能应该这样操作：

　　1、打开控制面板；

　　2、在左侧选择“经典视图”，然后在右侧选择“程序和功能”；

　　3、在出现的“程序和功能”窗口左侧中点击“打开或关闭Windows功能”；

　　4、在弹出的“Windows功能”窗口中勾选上“Telnet客户端”（如下图）；

　　5、确定后退出，Windows会自动开始配置激活；

　　6、在“开始搜索”框中输入“telnet”，久违的Telnet又出现啦！
*/

