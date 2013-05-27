define(["./color"],function(c){
	//console.log(c);
    //var colors = require("./color");
	function draw(color){
		console.log("draw width " + c[color]);
	};
	//console.log(draw);
	return {
		draw:draw
	}
});