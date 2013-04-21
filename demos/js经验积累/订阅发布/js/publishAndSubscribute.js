(function(ctx,win){
			var __topics={};

			function publish(name,data){
				var topic = __topics[name];
				if(!topic){

					return false;
				}
				topic.fire(data);
			};

			function subscribe(name,fn,ctx){
				var topic =__topics[name],
					fnId;
				if(!topic){
					topic = __topics[name] = new Topic(name);
				}
				fnId = topic.addSubsrcibute(fn,ctx);
				return fnId;
			};

			function unsubscribe(name,fnId){
				var topic =__topics[name]
				if(topic){
					topic.removeSubsrcibute(fnId);
				}
			};		
			function Topic(name,param){
				this.name = name;
				this.subscribeArr = [];
				this.uid=0;//回调
				this.param = param;
			}
			Topic.prototype = {
				addSubsrcibute:function(fn,ctx){
					var needCtx = false,
						fnId = this.uid;
					if(fn){
						if(typeof(fn) === "string"){
							needCtx = true;
						}else if(typeof(fn) !== "function"){
							throw "type error! Topic.addSubsrcibute"
						}
					}else{
						throw "Miss param:fn! Topic.addSubsrcibute";
					}
					if(needCtx){
						ctx = ctx || win;
						if(typeof(ctx) ==="string"){
							ctx = win[ctx];
						}
						this.subscribeArr[fnId] = ctx[fn];
						if(!ctx[fn]){
							throw "fn or ctx is error!";
						}
					}else{
						this.subscribeArr[fnId] = fn;
					}
					this.uid++;
					return fnId;											
				},
				removeSubsrcibute:function(fnId){
					if(this.subscribeArr[fnId]){
						delete this.subscribeArr[fnId];
					}
				},
				fire:function(data){
					var i=0,
						length = this.uid,
						eachSubscribe;
					for(;i<length;i++){
						eachSubscribe = this.subscribeArr[i];
						if(eachSubscribe && typeof(eachSubscribe) ==="function"){
							eachSubscribe(data);
						}
					}
				}
			};

			ctx.extend({
				publish:publish,
				subscribe:subscribe,
				unsubscribe:unsubscribe
			});
						
		})(jQuery,window);