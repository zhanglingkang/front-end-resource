function getConnect () {
	var mysql      = require('mysql'),
		connection = mysql.createConnection({
		  host     : 'localhost',
		  user     : 'root',
		  password : 'ok',
		  database : 'secondhandproduct'
		});
	connection.connect();
	return connection;
};
exports.getConnect = getConnect;
