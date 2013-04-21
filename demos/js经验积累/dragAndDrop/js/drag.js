(function(){
//e.PageX,offset  margin,padding存在时导致定位有问题
//拖动停止的时机也有问题。
	$(function(){
		var dragId,
		isDrag,
		offsetX = 0,
		offsetY = 0,
		prevX,
		prevY,
		dragElem;
		init();
		function init(){
			registerEvent();
		};
		function registerEvent(){
			$(".canDrag").bind("mousedown",function(e){
				var x = e.pageX,
					y = e.pageY,
					$This = $(this),
					//offset = $This.offset(),
					offset = $This.position(),
					scrollLeft = $This.scrollLeft(),
					scrollTop = $This.scrollTop(),
					left = offset.left + scrollLeft,
					top = offset.top + scrollTop;

				offsetX = x - left;
				offsetY = y - top;
				//console.log(offsetX,e.offsetX)  offsetX == e.offsetX 但firefox不支持e.offsetX
				//console.log($This.position().left == $This.offset().left,$This.position().top == $This.offset().top);
				isDrag = true;
				dragElem = $This;
				prevX = x;
				prevY = y;
				console.log("isDrag true " + e.type);
			});
			$(document).bind("mousemove",function(e){
				var x = e.pageX,
					y = e.pageY,
					left = x - offsetX,
					top = y - offsetY;
				//用偏移量

				if(isDrag){
					var moveX = x - prevX,
						moveY = y - prevY;
					left = dragElem.offset().left + dragElem.scrollLeft() + moveX;
					top = dragElem.offset().top + dragElem.scrollTop() + moveY;
					prevX = x;
					prevY = y;
					console.log(left,top);
					clearTimeout(dragId);
					dragId = setTimeout(function(){
						setPos(dragElem,left,top);
					},0);
					
				}
				

			});
			$(document).bind("mouseup",function(e){
				clearTimeout(dragId);
				isDrag = false;
				console.log("isDrag false " + e.type);
			});
		};
		function setPos(elem,left,top){
			//elem.addClass("pr");//"position:relative"
			elem.css({
				"position":"relative",
				"z-index":100,
				"left":left,
				"top":top
			});
			//setPos(elem,left,top);
		};

	})
})();