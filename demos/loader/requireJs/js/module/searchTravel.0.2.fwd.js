//发布订阅
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
                this.subscribeArr[fnId] = {};
                this.subscribeArr[fnId].fn = ctx[fn];
                this.subscribeArr[fnId].ctx = ctx;
                if(!ctx[fn]){
                    throw "fn or ctx is error!";
                }

                //console.dir(this.subscribeArr);
            }else{
                this.subscribeArr[fnId] = {};
                this.subscribeArr[fnId].fn = fn;
                this.subscribeArr[fnId].ctx = window;
            }
            this.uid++;
            return fnId;
        },
        removeSubsrcibute:function(fnId){
            fnId = parseInt(fnId);
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
                if(eachSubscribe && typeof(eachSubscribe).fn ==="function"){
                    eachSubscribe.fn.call(eachSubscribe.ctx,data);
                }
            }
        }
    };
    if(ctx.extend&& typeof(ctx.extend) === "function"){
        ctx.extend({
            publish:publish,
            subscribe:subscribe,
            unsubscribe:unsubscribe
        });
    }else{
        ctx.publish = publish;
        ctx.subscribe = subscribe;
        ctx.unsubscribe = unsubscribe;
    }

})(window,window);
(function(){
    fish.ready(init);
    var modules = {
        },
        searchConditionManageModule,
        searchTravModule,
        manageMapModule,
        mapModule,
        baiduCityDataHelp,
       paths = [],
       bounds = [],//放所有要画的路径
       points = [],//放所有点
        initStartPlace = getSearchCondition("startPlace"),
        initEndPlace = getSearchCondition("endPlace"),
        startInputAutoComplete,
        endInputAutoComplete;
    window.mapInfoObj = {};
    window.mapInfoObj.paths = paths;
    window.mapInfoObj.bounds = bounds;
    window.paths = paths;// for debugger
    window.bounds = bounds;// for debugger
    window.points = points;// for debugger


    function init(){
            fish.admin.config({
                mPop: { v: "0.2.2",css:1, g: 2013011601 }
            });
            if(fish.trim(getSearchCondition("cityFullName")) == "" || fish.trim(getSearchCondition("cityFullName")) == "cityName"){
            setSearchCondition("cityName","北京");
            setSearchCondition("cityFullName","北京");
        }

        initView();
        defModule(modules);
        //百度城市数据
        var uCityPickTemp = fish.one("#cityPickTempl"),
            uCityPickWrap = fish.one(".cityPickContsWrap");
        baiduCityDataHelp = modules.baiduCityDataModule;
        renderBaiduCityData({
            alphas:baiduCityDataHelp.getAllCityLettersArr(),
            cities:baiduCityDataHelp.getAllCities()
        },uCityPickTemp,uCityPickWrap);

        //搜索模块
        searchConditionManageModule = modules.searchConditionManageModule;
        searchTravModule =new  searchConditionManageModule.newModel({
            conditionChangeTitle:"seacrchMapConditionChange",
            searchTitle:"searchMap",
            updateConditionFn:mapConditionChanged,
            searchFn:searchMap,
            registerEvent:registerMapSearchEvent
        });

        //地图模块
        manageMapModule = modules.manageMapModule;
        mapModule = new manageMapModule.newModel({
            mapPanelSel:"searchBusMap",
            mapResPaneSel:"searchBusResMap",
            init:function(){
                registerMapEvent();//绑map上的事件
            }
        });




        mapModule.initMap({
            cityName:getSearchConditionObj().cityName,
            initMapUseCity:true
        });
        //一进页面就搜索
        if(getSearchCondition("searchNow") == "true"){
            window.publish("searchMap",{
                isStrPoint:"true",
                condition:getSearchCondition("searchUsePoint") == "true"?"point":false,
                startPoint:getSearchCondition("startPoint"),
                endPoint:getSearchCondition("endPoint"),
                startPlaceShowName:getSearchCondition("startPlace"),
                endPlaceShowName:getSearchCondition("endPlace")
            });
        }
        //window.mapModule = mapModule;//for debug
    };
    function initView(){
        fish.one(".pickedCity").html(getSearchCondition("cityFullName"));
        //将隐藏域中的值填入 input框中
        fish.one(".startPlace input").val(getSearchCondition("startPlace"));
        fish.one(".endPlace input").val(getSearchCondition("endPlace"));
    };
    function defModule(modules){
        modules.searchConditionManageModule = (function(radioModule){
            var  r = radioModule,//订阅发布模块
                 myExports ={},
                 MyModule,
                defaultOpt = {
                    conditionChangeTitle:"searchConditionChange",
                    searchTitle:"search"
                };

            MyModule = myExports.newModel = function(opt){
                var self = this;
                this.opt = {};
                fish.lang.extend(this.opt,defaultOpt);
                fish.lang.extend(this.opt,opt);
                r.subscribe(this.opt.conditionChangeTitle,
                    function(data){
                        self.updateConditionFn.call(self,data);
                    });//更新搜索条件
                r.subscribe(this.opt.searchTitle,
                    function(data){
                        self.searchFn.call(self,data);
                    });//进行搜索
                if(this.opt.registerEvent && typeof(this.opt.registerEvent) === "function"){
                    this.opt.registerEvent();
                }
            };
            MyModule.prototype.updateConditionFn = function(){
                var updateConditionFn = this.opt.updateConditionFn;
                if(updateConditionFn && typeof updateConditionFn == "function"  ){
                    updateConditionFn();
//                    r.publish(this.opt.searchTitle);
                }

            };
            MyModule.prototype.searchFn = function(data){
                var searchFn = this.opt.searchFn;
                if(searchFn && typeof searchFn == "function"  ){
                    searchFn(data);
                }
            };
            return myExports;
        })(window);

        modules.manageMapModule = (function(BMap,tools,radioModule){
            var myExports = {

                },
                hasAddNav = false,
                MyModule,
                POLICY_ARR=[//公交策略
                    {
                        "policyName":"lessTime",
                        "policyVal":BMAP_TRANSIT_POLICY_LEAST_TIME// 最少时间
                    } ,
                    {
                        "policyName":"lessTransfer",
                        "policyVal":BMAP_TRANSIT_POLICY_LEAST_TRANSFER// 最少换乘。
                    },
                    {
                        "policyName":"lessWalking",
                        "policyVal":BMAP_TRANSIT_POLICY_LEAST_WALKING// 最少步行。
                    },
                    {
                        "policyName":"avoidSubways",
                        "policyVal":BMAP_TRANSIT_POLICY_AVOID_SUBWAYS// 不乘地铁。
                    }
                ],
                defaultOpt = {
                    mapPanelSel:"mapPanel",
                    mapResPaneSel:"mapResPanel",//关于搜素结果的额外信息
                    initLat:31.298886,//纬度 苏州的经纬度
                    initLng:120.585316,//经度
                    zoomLever:11,//缩放等级
                    autoViewport:true,//自动调节视野
                    navControl:true,//平移缩放控件
                    customerMarker:true, //自定义搜索结果添加的标注
                    givePlaceSuggestion:true //当查不到公交时，是否给提示

                };
            MyModule = myExports.newModel = function(opt){
                this.opt = {};
                fish.lang.extend(this.opt,defaultOpt);
                fish.lang.extend(this.opt,opt);
                if(this.opt.init && tools.isFunction(this.opt.init)){
                    this.opt.init();//进行一些事件委托
                }
            };
            MyModule.prototype.getMapObj = function(sepOpt){
                if(!this.hasInit || sepOpt.update){
                    this.currMapObj = this.initMap(sepOpt);
                    this.hasInit = true;
                }
                return this.currMapObj;
            };

            MyModule.prototype.initMap = function(speOpt){
                var param = this.getConbinedOpt(speOpt),
                    map = new BMap.Map(param.mapPanelSel),
                    searchCtrl,//可进行搜索服务操作的句柄
                    searchRange = param.searchRange || map;//检索区域可以是BMap.Map对象、BMap.Point对象或者是省市名称（比如："北京市"）的字符串
                if(speOpt.searchType){//对地图进行一些服务的操作
                    if(param.initMapUseCity){
                        //有些坑人，如果用  map.centerAndZoom(param.cityName);然后传map会失败
                        searchCtrl = new BMap[speOpt.searchType](param.cityName,{
                            renderOptions:{
                                map: map,
                                autoViewport:param.autoViewport
                            }
                        });

                    }else{
                        map.centerAndZoom(new BMap.Point(param.initLng, param.initLat), param.zoomLever);//以经纬度进行初始化
                        searchCtrl = new BMap[speOpt.searchType](map,{
                            renderOptions:{
                                map: map,
                                autoViewport:param.autoViewport
                            }
                        });
                    }
                }else{//仅仅是初始化
                    if(param.initMapUseCity){
                        map.centerAndZoom(param.cityName);
                    }else{
                        map.centerAndZoom(new BMap.Point(param.initLng, param.initLat), param.zoomLever);
                    }
                }


                map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
                map.enableScrollWheelZoom();    //启用滚轮放大缩小，默认禁用

                if(param.navControl){
                    window.mapNavControl && map.removeControl(window.mapNavControl);
                    window.mapNavControl = new BMap.NavigationControl();
                    map.addControl(window.mapNavControl);
                }


                return {
                    searchCtrl:searchCtrl,
                    map:map
                };

            };
            /*
             * infoWindow
             *
            */
            MyModule.prototype.makeInfoWindow = function(html){
                var infoWindow = new BMap.InfoWindow(html);
                return infoWindow;
            }
            /*
             * 自定义overlay 覆盖物
             * callBackObj:overlay的事件 类似 [{
             * eventName:click,eventFn:fn},{eventName:mouseover,eventFn:fn}...]
             *
             * */
            MyModule.prototype.customerOverlay = function(param,bindEventObj){
                var myModule = this;
                function CustomerOverLay(){
                        this._center = param.center;//点的位置
                        this.width = param.width;//覆盖物的宽
                        this.height = param.height;
                        this.className = param.className;
                        this.html = param.html;
                };


                CustomerOverLay.prototype = new BMap.Overlay();
                CustomerOverLay.prototype.initialize = function(map){
                    var that = this;
                    this._map = map;
                    // 创建div元素，作为自定义覆盖物的容器
                    var overlay = document.createElement("div"),
                        uOverlay = fish.one(overlay);
                    overlay.style.position = "absolute";
                    this.html && uOverlay.html(this.html);
                    //依靠className 来设置外观
                    this.className && uOverlay.addClass(this.className);
                    //添加 overlay
                    map.getPanes().markerPane.appendChild(overlay);
                    this._overlay = overlay;
                    if(bindEventObj){
                        if(bindEventObj.click && tools.isFunction(bindEventObj.click)){
                            uOverlay.on("click",function(evt){
                                bindEventObj.click(evt,this,map,that._center);
                            })
                        }

                        if(bindEventObj.hover && bindEventObj.hover[0] && bindEventObj.hover[1]){
                            uOverlay.hover(function(evt){
                                bindEventObj.hover[0](evt,this);
                            },function(evt){
                                bindEventObj.hover[1](evt,this);
                            });
                        }
                    }
                    return overlay;
                }
                // 实现绘制方法
                CustomerOverLay.prototype.draw = function(){
                    // 根据地理坐标转换为像素坐标，并设置给容器
                    var position = this._map.pointToOverlayPixel(this._center);
//                    this._overlay.style.left = position.x - this.width / 2 + "px";
//                    this._overlay.style.top = position.y - this.height / 2 + "px";
                    this._overlay.style.left = position.x -12 +"px";//px一定要加，否则不显示，这两个值是为了覆盖地图的标默认的
                    this._overlay.style.top = position.y -27 + "px";
                }
                // 实现显示方法
                CustomerOverLay.prototype.show = function(){
                    if (this._overlay){
                        this._overlay.style.display = "";
                    }
                }
                // 实现隐藏方法
                CustomerOverLay.prototype.hide = function(){
                    if (this._overlay){
                        this._overlay.style.display = "none";
                    }
                }

                return CustomerOverLay;

            };
             /*
            * 公交查询
            * */
            MyModule.prototype.travSearch = function(speOpt){
                var param = this.getConbinedOpt(speOpt),
                    mapObj,
                    searchCtrl,
                    policy,
                    allbackFn,
                    localSearch,
                    that = this,
                    startPlace,
                    endPlace,
                    isReallyNotFind = false,
                    searchWithPoint = false;
                param.searchType = "TransitRoute";
                param.initMapUseCity = true;
                mapObj = this.getMapObj(param);
                searchCtrl = mapObj.searchCtrl;
                if(param.policy != undefined && this.isPolicyValid(param.policy)){
                    policy = this.getPolicyValByName(param.policy);
                    searchCtrl.setPolicy(policy);
                }
                //自定义搜索结果
                if(param.completeCallback && tools.isFunction(param.completeCallback)){
                    searchCtrl.setSearchCompleteCallback (function(results){
                        if(typeof(param.startPlace) === "object" ){//startPlace 是个点（经纬度）
                            startPlace = param.startPlaceShowName;
                            searchWithPoint = true;
                        }else{
                            startPlace = param.startPlace;
                        }

                        if(typeof(param.endPlace) === "object" ){//startPlace 是个点（经纬度）
                            endPlace = param.endPlaceShowName;
                            searchWithPoint = true;
                        }else{
                            endPlace = param.endPlace;
                        }

                        if(searchCtrl.getStatus() == BMAP_STATUS_SUCCESS){//查到换乘方案

                            param.completeCallback(results,{
                                isFind:true,
                                mapResPaneSel:param.mapResPaneSel,
                                map:mapObj.map,
                                startPlace:startPlace,
                                endPlace:endPlace,
                                cityName:param.cityName
                            });
                            if(param.finalFn && tools.isFunction(param.finalFn)){
                                param.finalFn({
                                    isFind:true
                                });
                            }
                        }else{ //未查到换乘方案
                            if(searchWithPoint){
                                isReallyNotFind = true;//最终也没找到
                            }
                            if(param.givePlaceSuggestion && !isReallyNotFind){//对终点和起点的提示。若之前是用点查的，则不需要提示再
                                allbackFn = _.after(2,function(){//只要起点和终点的结果均回来时才会执行,只有两个异步，所以传2.
                                    if(param.finalFn && tools.isFunction(param.finalFn)){
                                        param.finalFn({
                                            isFind:false,
                                            isReallyNotFind:false
                                        });
                                    }
                                });
                                //搜起点提示
                                localSearch = new BMap.LocalSearch(param.cityName,{
                                    renderOptions:{
                                        map: mapObj.map,
                                        autoViewport:true
                                    },
                                    onSearchComplete: function(results){
//                                    mapObj.map.clearOverlays();
                                        param.completeCallback(results,{
                                            isFind:false,
                                            type:"startPlace",
                                            mapResPaneSel:param.mapResPaneSel,
                                            map:mapObj.map,
                                            startPlace:startPlace,
                                            endPlace:endPlace,
                                            cityName:param.cityName
                                        });

                                        if(results.getCurrentNumPois() >0 ){ //如果有结果
                                            //自定义标注点 以及弹出信息框
                                            if(param.customerMarker){
                                                that.addCustomerMarkerAndInfoWindow(results,mapObj);
                                            }
                                        }else{
                                            //不让地图出现什么都查不到的样子
                                            that.initMap({
                                                cityName:param.cityName,
                                                initMapUseCity:true
                                            });
                                        }


//
                                        allbackFn();
                                    }

                                });
                                //貌似是异步的
//                            localSearch.setMarkersSetCallback(function(results){

                                //                                results.forEach(function(eachRes){
//                                    var eachMarker = eachRes.marker,
//                                        dMarker = eachMarker.domElement,
//                                        uMarker;
//                                    if(dMarker){
//                                        uMarker = fish.one(dMarker);
//                                        uMarker.addClass("none");//隐藏系统的图标,貌似那元素
//                                    }
//
//                                })
//                            });

                                localSearch.disableFirstResultSelection();//禁用自动选择第一个检索结果。
                                localSearch.search(param.startPlace);

                                //搜终点提示
                                localSearch = new BMap.LocalSearch(param.cityName,{
//                                renderOptions:{map: mapObj.map},
                                    onSearchComplete: function(results){
                                        param.completeCallback(results,{
                                            isFind:false,
                                            type:"endPlace",
                                            mapResPaneSel:param.mapResPaneSel,
                                            map:mapObj.map,
                                            startPlace:startPlace,
                                            endPlace:endPlace,
                                            cityName:param.cityName
                                        });
                                        allbackFn();

                                    }

                                });
                                localSearch.search(param.endPlace);
                            }else{
                                fish.mPop({
                                    content:fish.one("#loadingWrap"),
                                    overlay:false
                                });
                                var driveCtrl = new BMap.DrivingRoute(mapObj.map,{
                                    renderOptions: {
                                        map   : mapObj.map,
                                        autoViewport: true
                                    },
                                    onSearchComplete:function(results){
                                        var plan = results.getPlan(0);
                                         if(driveCtrl.getStatus()==BMAP_STATUS_SUCCESS){
                                             if(plan.getDistance(false)<1000){
                                                 param.finalFn({
                                                     isFind:false,
                                                     isReallyNotFind:true,
                                                     tooNear:true,//建议步行
                                                     startPlace:startPlace,
                                                     endPlace:endPlace
                                                 });
                                             }else{
                                                 param.finalFn({
                                                     isFind:false,
                                                     isReallyNotFind:true,
                                                     startPlace:startPlace,
                                                     endPlace:endPlace
                                                 });
                                             }
                                         }else{
                                             param.finalFn({
                                                 isFind:false,
                                                 isReallyNotFind:true,
                                                 startPlace:startPlace,
                                                 endPlace:endPlace
                                             });
                                         }
                                    }
                                });

                                driveCtrl.search(param.startPlace,param.endPlace);//经纬度

                            }

                        }


                    });
                }

                searchCtrl.search(param.startPlace,param.endPlace);//地名或点

            };
            //本地搜索
            MyModule.prototype.localSearch = function(speOpt){
                var param = this.getConbinedOpt(speOpt),
                    that = this,
                    mapObj,
                    searchCtrl;
                param.searchType = "LocalSearch";
                param.initMapUseCity = true;
                mapObj = this.getMapObj(param);
                searchCtrl = mapObj.searchCtrl;
                //自定义搜索结果
                searchCtrl.setSearchCompleteCallback(function(results){
                    if(searchCtrl.getStatus() == BMAP_STATUS_SUCCESS){
//                            mapObj.map.clearOverlays();
                        if(results.getCurrentNumPois() == 0){//未查到结果
                            //不让地图什么都不显示
                            that.initMap({
                                cityName:param.cityName,
                                initMapUseCity:true
                            });
                        }
                        if(param.completeCallback && tools.isFunction(param.completeCallback)){
                            param.completeCallback(results,{

                            });
                        }

                        //自定义 标注和信息弹出层
                        if(param.customerMarker){
                            that.addCustomerMarkerAndInfoWindow(results,mapObj);
                        }
                    }else{
                        //不让地图什么都不显示
                        that.initMap({
                            cityName:param.cityName,
                            initMapUseCity:true
                        });
                    }

                });

                //标注添加好后
                searchCtrl.setMarkersSetCallback(function(results){
//                    console.log(results);
                });
                searchCtrl.disableFirstResultSelection();//禁用自动选择第一个检索结果。
                searchCtrl.search(param.place);

            };
            //添加自定义点的标注，以及弹出框
            MyModule.prototype.addCustomerMarkerAndInfoWindow = function(results,mapObj){
                var that = this,
                    pointLocArr = [],
                    pointInfoArr = [],
                    pointsLength = results.getCurrentNumPois();//当前页的数量
                tools(pointsLength).times(function(index){
                    var eachPoint = results.getPoi(index),
                        eachLoc = eachPoint.point,
                        eachPointInfo = {};
                    pointLocArr.push(eachLoc);
                    eachPointInfo.pointTitle = eachPoint.title;
                    eachPointInfo.address = eachPoint.address;
                    pointInfoArr.push(eachPointInfo);
                });

                pointLocArr.forEach(function(eachLoc,i){
                    var CustomerMarker = that.customerOverlay({
                            className:"mapMarkerIconWrap clearfix",
                            center:eachLoc,
                            width:24,
                            height:32,
                            html:"<div class='ab suggestIndexIcon index"+(i+1)+"'></div</div>"

                        },{
                            "click":function(evt,ctx,map,point){
                                map.openInfoWindow(infoWindow,point);
                            },
                            "hover":[function(evt,ctx){
                                var uThis = fish.one(ctx);
                                uThis.addClass("hoverMapIcon");
                            },function(evt,ctx){
                                var uThis = fish.one(ctx);
                                uThis.removeClass("hoverMapIcon");
                            }]
                        }),
                        marker= new CustomerMarker(),
                        eachPointInfo = pointInfoArr[i],
                        infoWindow = that.makeInfoWindow();
                    infoWindow.setTitle(eachPointInfo.pointTitle);
                    infoWindow.setContent(eachPointInfo.address);
                    mapObj.map.addOverlay(marker);
//                                            //给marker绑事件
//                                           marker.addEventListener("click",function(){
//                                                this.openInfoWindow(infoWindow);
//                                           });
//                                           marker.addEventListener("mouseover",function(){
//                                              console.log(this);
//                                           });

                });
                if(pointLocArr[0]){//将地图中心移动至第一个点
                    mapObj.map.panTo(pointLocArr[0]);
                }
            };
            //用自定义的和百度的policy均是合法的。
            MyModule.prototype.isPolicyValid = function(policy){
                var policyNameArr = tools.pluck(POLICY_ARR,"policyName"),
                    policyValArr = tools.pluck(POLICY_ARR,"policyVal"),
                    isPolicyValid;
                if(tools.contains(policyNameArr,policy) || tools.contains(policyValArr,policy)){
                    isPolicyValid = true;
                }else{
                    isPolicyValid = false;
                }
                return isPolicyValid;

            };
            MyModule.prototype.getPolicyValByName = function(policyName){
                var policyNameArr = tools.pluck(POLICY_ARR,"policyName"),
                    policyValArr = tools.pluck(POLICY_ARR,"policyVal"),
                    policyObj;
              if(this.isPolicyValid(policyName)){
                  if(tools.contains(policyNameArr,policyName)){
                      policyObj =  tools.find(POLICY_ARR,function(each){
                          return each.policyName == policyName;
                      });
                      return policyObj.policyVal;
                  }
                  else if(tools.contains(policyValArr,policyName)){
                      return policyName;
                  }
                  else{
                      throw "Function:isPolicyValid has bugs...";
                      return false;
                  }
              }else{
                  return false;
              }
            };
            MyModule.prototype.getConbinedOpt = function(speOpt){
                var opt;
                if(speOpt){
                    opt = {};
                    fish.lang.extend(opt,this.opt);
                    fish.lang.extend(opt,speOpt);
                }else{
                    opt =  this.opt;
                }
                return opt;
            } ;
            return myExports;
        })(BMap,_,window);
        //百度城市数据
        modules.baiduCityDataModule = (function(_){
            var baiduCityData = [{id:"s1",name:"安徽",type:"prov",idx:"A"},{id:"s2",name:"福建",type:"prov",idx:"F",code:"5785"},{id:"s3",name:"甘肃",type:"prov",idx:"G",code:"5775"},{id:"s4",name:"广东",type:"prov",idx:"G",code:"5776"},{id:"s5",name:"广西",type:"prov",idx:"G",code:"5786"},{id:"s6",name:"贵州",type:"prov",idx:"G",code:"5793"},{id:"s7",name:"海南",type:"prov",idx:"H",code:"5790"},{id:"s8",name:"河北",type:"prov",idx:"H",code:"5794"},{id:"s9",name:"河南",type:"prov",idx:"H",code:"5799"},{id:"s10",name:"黑龙江",type:"prov",idx:"H",code:"5771"},{id:"s11",name:"湖北",type:"prov",idx:"H",code:"5784"},{id:"s12",name:"湖南",type:"prov",idx:"H",code:"5795"},{id:"s13",name:"江苏",type:"prov",idx:"J",code:"5787"},{id:"s14",name:"江西",type:"prov",idx:"J",code:"5800"},{id:"s15",name:"吉林",fullName:"吉林省",type:"prov",idx:"J",code:"5778"},{id:"s16",name:"辽宁",type:"prov",idx:"L",code:"5788"},{id:"s17",name:"内蒙古",type:"prov",idx:"N",code:"5791"},{id:"s18",name:"宁夏",type:"prov",idx:"N",code:"5789"},{id:"s19",name:"青海",type:"prov",idx:"Q",code:"5780"},{id:"s20",name:"山东",type:"prov",idx:"S",code:"5777"},{id:"s21",name:"山西",type:"prov",idx:"S",code:"5779"},{id:"s22",name:"陕西",type:"prov",idx:"S",code:"5796"},{id:"s23",name:"四川",type:"prov",idx:"S",code:"5801"},{id:"s24",name:"西藏",type:"prov",idx:"X",code:"5782"},{id:"s25",name:"新疆",type:"prov",idx:"X",code:"5781"},{id:"s26",name:"云南",type:"prov",idx:"Y",code:"5797"},{id:"s27",name:"浙江",type:"prov",idx:"Z",code:"5798"},{id:"s28",name:"合肥",type:"city",idx:"H",pid:"s1"},{id:"s29",name:"安庆",type:"city",idx:"A",pid:"s1"},{id:"s30",name:"蚌埠",type:"city",idx:"B",pid:"s1"},{id:"s31",name:"亳州",type:"city",idx:"H",pid:"s1"},{id:"s32",name:"巢湖",type:"city",idx:"C",pid:"s1"},{id:"s33",name:"池州",type:"city",idx:"C",pid:"s1"},{id:"s34",name:"滁州",type:"city",idx:"C",pid:"s1"},{id:"s35",name:"阜阳",type:"city",idx:"F",pid:"s1"},{id:"s37",name:"淮北",type:"city",idx:"H",pid:"s1"},{id:"s38",name:"淮南",type:"city",idx:"H",pid:"s1"},{id:"s39",name:"黄山",type:"city",idx:"H",pid:"s1"},{id:"s40",name:"六安",type:"city",idx:"L",pid:"s1"},{id:"s41",name:"马鞍山",type:"city",idx:"M",pid:"s1"},{id:"s42",name:"宿州",type:"city",idx:"S",pid:"s1"},{id:"s43",name:"铜陵",type:"city",idx:"T",pid:"s1"},{id:"s44",name:"芜湖",type:"city",idx:"W",pid:"s1"},{id:"s45",name:"宣城",type:"city",idx:"X",pid:"s1"},{id:"s46",name:"福州",type:"city",idx:"F",pid:"s2"},{id:"s47",name:"龙岩",type:"city",idx:"L",pid:"s2"},{id:"s48",name:"南平",type:"city",idx:"N",pid:"s2"},{id:"s49",name:"宁德",type:"city",idx:"N",pid:"s2"},{id:"s50",name:"莆田",type:"city",idx:"P",pid:"s2"},{id:"s51",name:"泉州",type:"city",idx:"Q",pid:"s2"},{id:"s52",name:"三明",type:"city",idx:"S",pid:"s2"},{id:"s53",name:"厦门",type:"city",idx:"X",pid:"s2"},{id:"s54",name:"漳州",type:"city",idx:"Z",pid:"s2"},{id:"s55",name:"兰州",type:"city",idx:"L",pid:"s3"},{id:"s56",name:"白银",type:"city",idx:"B",pid:"s3"},{id:"s57",name:"定西",type:"city",idx:"D",pid:"s3"},{id:"s58",name:"甘南州",fullName:"甘南藏族自治州",type:"city",idx:"G",pid:"s3"},{id:"s59",name:"嘉峪关",type:"city",idx:"J",pid:"s3"},{id:"s60",name:"金昌",type:"city",idx:"J",pid:"s3"},{id:"s61",name:"酒泉",type:"city",idx:"J",pid:"s3"},{id:"s62",name:"临夏州",fullName:"临夏回族自治州",type:"city",idx:"L",pid:"s3"},{id:"s63",name:"陇南",type:"city",idx:"L",pid:"s3"},{id:"s64",name:"平凉",type:"city",idx:"P",pid:"s3"},{id:"s65",name:"庆阳",type:"city",idx:"Q",pid:"s3"},{id:"s66",name:"天水",type:"city",idx:"T",pid:"s3"},{id:"s67",name:"武威",type:"city",idx:"W",pid:"s3"},{id:"s68",name:"张掖",type:"city",idx:"Z",pid:"s3"},{id:"s69",name:"广州",type:"city",idx:"G",pid:"s4"},{id:"s70",name:"潮州",type:"city",idx:"C",pid:"s4"},{id:"s71",name:"东莞",type:"city",idx:"D",pid:"s4"},{id:"s72",name:"佛山",type:"city",idx:"F",pid:"s4"},{id:"s73",name:"河源",type:"city",idx:"H",pid:"s4"},{id:"s74",name:"惠州",type:"city",idx:"H",pid:"s4"},{id:"s392",name:"江门",type:"city",idx:"J",pid:"s4"},{id:"s75",name:"揭阳",type:"city",idx:"J",pid:"s4"},{id:"s76",name:"茂名",type:"city",idx:"M",pid:"s4"},{id:"s77",name:"梅州",type:"city",idx:"M",pid:"s4"},{id:"s78",name:"清远",type:"city",idx:"Q",pid:"s4"},{id:"s79",name:"汕头",type:"city",idx:"S",pid:"s4"},{id:"s80",name:"汕尾",type:"city",idx:"S",pid:"s4"},{id:"s81",name:"韶关",type:"city",idx:"S",pid:"s4"},{id:"s82",name:"深圳",type:"city",idx:"S",pid:"s4"},{id:"s83",name:"阳江",type:"city",idx:"Y",pid:"s4"},{id:"s84",name:"云浮",type:"city",idx:"Y",pid:"s4"},{id:"s85",name:"湛江",type:"city",idx:"Z",pid:"s4"},{id:"s86",name:"肇庆",type:"city",idx:"Z",pid:"s4"},{id:"s87",name:"中山",type:"city",idx:"Z",pid:"s4"},{id:"s88",name:"珠海",type:"city",idx:"Z",pid:"s4"},{id:"s89",name:"南宁",type:"city",idx:"N",pid:"s5"},{id:"s90",name:"百色",type:"city",idx:"B",pid:"s5"},{id:"s91",name:"北海",type:"city",idx:"B",pid:"s5"},{id:"s92",name:"崇左",type:"city",idx:"C",pid:"s5"},{id:"s93",name:"防城港",type:"city",idx:"F",pid:"s5"},{id:"s94",name:"桂林",type:"city",idx:"G",pid:"s5"},{id:"s95",name:"贵港",type:"city",idx:"G",pid:"s5"},{id:"s96",name:"河池",type:"city",idx:"H",pid:"s5"},{id:"s97",name:"贺州",type:"city",idx:"H",pid:"s5"},{id:"s98",name:"来宾",type:"city",idx:"L",pid:"s5"},{id:"s99",name:"柳州",type:"city",idx:"L",pid:"s5"},{id:"s100",name:"钦州",type:"city",idx:"Q",pid:"s5"},{id:"s101",name:"梧州",type:"city",idx:"W",pid:"s5"},{id:"s102",name:"玉林",type:"city",idx:"Y",pid:"s5"},{id:"s103",name:"贵阳",type:"city",idx:"G",pid:"s6"},{id:"s104",name:"安顺",type:"city",idx:"A",pid:"s6"},{id:"s105",name:"毕节地区",type:"city",idx:"B",pid:"s6"},{id:"s106",name:"六盘水",type:"city",idx:"L",pid:"s6"},{id:"s107",name:"铜仁地区",type:"city",idx:"T",pid:"s6"},{id:"s108",name:"遵义",type:"city",idx:"Z",pid:"s6"},{id:"s109",name:"黔西南州",fullName:"黔西南布依族苗族自治州",type:"city",idx:"Q",pid:"s6"},{id:"s110",name:"黔东南州",fullName:"黔东南苗族侗族自治州",type:"city",idx:"Q",pid:"s6"},{id:"s111",name:"黔南州",fullName:"黔南布依族苗族自治州",type:"city",idx:"Q",pid:"s6"},{id:"s112",name:"海口",type:"city",idx:"H",pid:"s7"},{id:"s113",name:"白沙",fullName:"白沙黎族自治县",type:"city",idx:"B",pid:"s7"},{id:"s114",name:"保亭",fullName:"保亭黎族苗族自治县",type:"city",idx:"B",pid:"s7"},{id:"s115",name:"昌江",fullName:"昌江黎族自治县",type:"city",idx:"C",pid:"s7"},{id:"s116",name:"儋州",type:"city",idx:"D",pid:"s7"},{id:"s117",name:"澄迈",type:"city",idx:"C",pid:"s7"},{id:"s118",name:"东方",type:"city",idx:"D",pid:"s7"},{id:"s119",name:"定安",type:"city",idx:"D",pid:"s7"},{id:"s120",name:"琼海",type:"city",idx:"Q",pid:"s7"},{id:"s121",name:"琼中",fullName:"琼中黎族苗族自治县",type:"city",idx:"Q",pid:"s7"},{id:"s122",name:"乐东",fullName:"乐东黎族自治县",type:"city",idx:"L",pid:"s7"},{id:"s123",name:"临高",type:"city",idx:"H",pid:"s7"},{id:"s124",name:"陵水",fullName:"陵水黎族自治县",type:"city",idx:"Q",pid:"s7"},{id:"s125",name:"三亚",type:"city",idx:"S",pid:"s7"},{id:"s126",name:"屯昌",type:"city",idx:"T",pid:"s7"},{id:"s127",name:"万宁",type:"city",idx:"W",pid:"s7"},{id:"s128",name:"文昌",type:"city",idx:"W",pid:"s7"},{id:"s129",name:"五指山",type:"city",idx:"W",pid:"s7"},{id:"s130",name:"石家庄",type:"city",idx:"S",pid:"s8"},{id:"s131",name:"保定",type:"city",idx:"B",pid:"s8"},{id:"s132",name:"沧州",type:"city",idx:"C",pid:"s8"},{id:"s133",name:"承德",type:"city",idx:"C",pid:"s8"},{id:"s134",name:"邯郸",type:"city",idx:"H",pid:"s8"},{id:"s135",name:"衡水",type:"city",idx:"H",pid:"s8"},{id:"s136",name:"廊坊",type:"city",idx:"L",pid:"s8"},{id:"s137",name:"秦皇岛",type:"city",idx:"Q",pid:"s8"},{id:"s138",name:"唐山",type:"city",idx:"T",pid:"s8"},{id:"s139",name:"邢台",type:"city",idx:"X",pid:"s8"},{id:"s140",name:"张家口",type:"city",idx:"Z",pid:"s8"},{id:"s141",name:"郑州",type:"city",idx:"Z",pid:"s9"},{id:"s142",name:"安阳",type:"city",idx:"A",pid:"s9"},{id:"s143",name:"鹤壁",type:"city",idx:"H",pid:"s9"},{id:"s144",name:"焦作",type:"city",idx:"J",pid:"s9"},{id:"s145",name:"开封",type:"city",idx:"K",pid:"s9"},{id:"s146",name:"洛阳",type:"city",idx:"L",pid:"s9"},{id:"s147",name:"漯河",type:"city",idx:"L",pid:"s9"},{id:"s148",name:"南阳",type:"city",idx:"N",pid:"s9"},{id:"s149",name:"平顶山",type:"city",idx:"P",pid:"s9"},{id:"s150",name:"濮阳",type:"city",idx:"P",pid:"s9"},{id:"s151",name:"三门峡",type:"city",idx:"S",pid:"s9"},{id:"s152",name:"商丘",type:"city",idx:"S",pid:"s9"},{id:"s153",name:"新乡",type:"city",idx:"X",pid:"s9"},{id:"s154",name:"信阳",type:"city",idx:"X",pid:"s9"},{id:"s155",name:"许昌",type:"city",idx:"X",pid:"s9"},{id:"s156",name:"周口",type:"city",idx:"Z",pid:"s9"},{id:"s391",name:"驻马店",type:"city",idx:"Z",pid:"s9"},{id:"s157",name:"哈尔滨",type:"city",idx:"H",pid:"s10"},{id:"s158",name:"大庆",type:"city",idx:"D",pid:"s10"},{id:"s159",name:"大兴安岭地区",type:"city",idx:"D",pid:"s10"},{id:"s160",name:"鹤岗",type:"city",idx:"H",pid:"s10"},{id:"s161",name:"黑河",type:"city",idx:"H",pid:"s10"},{id:"s162",name:"鸡西",type:"city",idx:"J",pid:"s10"},{id:"s163",name:"佳木斯",type:"city",idx:"J",pid:"s10"},{id:"s164",name:"牡丹江",type:"city",idx:"M",pid:"s10"},{id:"s165",name:"七台河",type:"city",idx:"Q",pid:"s10"},{id:"s166",name:"齐齐哈尔",type:"city",idx:"Q",pid:"s10"},{id:"s167",name:"双鸭山",type:"city",idx:"S",pid:"s10"},{id:"s168",name:"绥化",type:"city",idx:"S",pid:"s10"},{id:"s169",name:"伊春",type:"city",idx:"Y",pid:"s10"},{id:"s170",name:"武汉",type:"city",idx:"W",pid:"s11"},{id:"s171",name:"鄂州",type:"city",idx:"E",pid:"s11"},{id:"s172",name:"恩施",fullName:"恩施土家族苗族自治州",type:"city",idx:"N",pid:"s11"},{id:"s173",name:"黄冈",type:"city",idx:"H",pid:"s11"},{id:"s174",name:"黄石",type:"city",idx:"H",pid:"s11"},{id:"s175",name:"荆门",type:"city",idx:"J",pid:"s11"},{id:"s176",name:"荆州",type:"city",idx:"J",pid:"s11"},{id:"s177",name:"潜江",type:"city",idx:"Q",pid:"s11"},{id:"s178",name:"神农架林区",type:"city",idx:"S",pid:"s11"},{id:"s179",name:"十堰",type:"city",idx:"S",pid:"s11"},{id:"s180",name:"随州",type:"city",idx:"S",pid:"s11"},{id:"s181",name:"天门",type:"city",idx:"T",pid:"s11"},{id:"s182",name:"仙桃",type:"city",idx:"X",pid:"s11"},{id:"s183",name:"咸宁",type:"city",idx:"X",pid:"s11"},{id:"s184",name:"襄阳",type:"city",idx:"X",pid:"s11"},{id:"s185",name:"孝感",type:"city",idx:"X",pid:"s11"},{id:"s186",name:"宜昌",type:"city",idx:"Y",pid:"s11"},{id:"s187",name:"长沙",type:"city",idx:"C",pid:"s12"},{id:"s188",name:"常德",type:"city",idx:"C",pid:"s12"},{id:"s189",name:"郴州",type:"city",idx:"C",pid:"s12"},{id:"s190",name:"衡阳",type:"city",idx:"H",pid:"s12"},{id:"s191",name:"怀化",type:"city",idx:"H",pid:"s12"},{id:"s192",name:"娄底",type:"city",idx:"L",pid:"s12"},{id:"s193",name:"邵阳",type:"city",idx:"S",pid:"s12"},{id:"s194",name:"湘潭",type:"city",idx:"X",pid:"s12"},{id:"s195",name:"湘西州",fullName:"湘西土家族苗族自治州",type:"city",idx:"X",pid:"s12"},{id:"s196",name:"益阳",type:"city",idx:"Y",pid:"s12"},{id:"s197",name:"永州",type:"city",idx:"Y",pid:"s12"},{id:"s198",name:"岳阳",type:"city",idx:"Y",pid:"s12"},{id:"s199",name:"张家界",type:"city",idx:"Z",pid:"s12"},{id:"s200",name:"株洲",type:"city",idx:"Z",pid:"s12"},{id:"s201",name:"南京",type:"city",idx:"N",pid:"s13"},{id:"s202",name:"常州",type:"city",idx:"C",pid:"s13"},{id:"s203",name:"淮安",type:"city",idx:"H",pid:"s13"},{id:"s204",name:"连云港",type:"city",idx:"L",pid:"s13"},{id:"s205",name:"南通",type:"city",idx:"N",pid:"s13"},{id:"s206",name:"苏州",type:"city",idx:"S",pid:"s13"},{id:"s207",name:"宿迁",type:"city",idx:"S",pid:"s13"},{id:"s208",name:"泰州",type:"city",idx:"T",pid:"s13"},{id:"s209",name:"无锡",type:"city",idx:"W",pid:"s13"},{id:"s210",name:"徐州",type:"city",idx:"X",pid:"s13"},{id:"s211",name:"盐城",type:"city",idx:"Y",pid:"s13"},{id:"s212",name:"扬州",type:"city",idx:"Y",pid:"s13"},{id:"s213",name:"镇江",type:"city",idx:"Z",pid:"s13"},{id:"s214",name:"南昌",type:"city",idx:"N",pid:"s14"},{id:"s215",name:"抚州",type:"city",idx:"W",pid:"s14"},{id:"s216",name:"赣州",type:"city",idx:"G",pid:"s14"},{id:"s217",name:"吉安",type:"city",idx:"J",pid:"s14"},{id:"s218",name:"景德镇",type:"city",idx:"J",pid:"s14"},{id:"s219",name:"九江",type:"city",idx:"J",pid:"s14"},{id:"s220",name:"萍乡",type:"city",idx:"P",pid:"s14"},{id:"s221",name:"上饶",type:"city",idx:"S",pid:"s14"},{id:"s222",name:"新余",type:"city",idx:"X",pid:"s14"},{id:"s223",name:"宜春",type:"city",idx:"Y",pid:"s14"},{id:"s224",name:"鹰潭",type:"city",idx:"Y",pid:"s14"},{id:"s225",name:"长春",type:"city",idx:"C",pid:"s15"},{id:"s226",name:"白城",type:"city",idx:"B",pid:"s15"},{id:"s227",name:"白山",type:"city",idx:"B",pid:"s15"},{id:"s228",name:"吉林市",type:"city",idx:"J",pid:"s15"},{id:"s229",name:"辽源",type:"city",idx:"L",pid:"s15"},{id:"s230",name:"四平",type:"city",idx:"S",pid:"s15"},{id:"s231",name:"松原",type:"city",idx:"S",pid:"s15"},{id:"s232",name:"通化",type:"city",idx:"T",pid:"s15"},{id:"s233",name:"延边",fullName:"延边朝鲜族自治州",type:"city",idx:"Y",pid:"s15"},{id:"s234",name:"沈阳",type:"city",idx:"S",pid:"s16"},{id:"s235",name:"鞍山",type:"city",idx:"A",pid:"s16"},{id:"s236",name:"本溪",type:"city",idx:"B",pid:"s16"},{id:"s237",name:"朝阳",type:"city",idx:"C",pid:"s16"},{id:"s238",name:"大连",type:"city",idx:"D",pid:"s16"},{id:"s239",name:"丹东",type:"city",idx:"D",pid:"s16"},{id:"s240",name:"抚顺",type:"city",idx:"F",pid:"s16"},{id:"s241",name:"阜新",type:"city",idx:"F",pid:"s16"},{id:"s242",name:"葫芦岛",type:"city",idx:"H",pid:"s16"},{id:"s243",name:"锦州",type:"city",idx:"J",pid:"s16"},{id:"s244",name:"辽阳",type:"city",idx:"L",pid:"s16"},{id:"s245",name:"盘锦",type:"city",idx:"P",pid:"s16"},{id:"s246",name:"铁岭",type:"city",idx:"T",pid:"s16"},{id:"s247",name:"营口",type:"city",idx:"Y",pid:"s16"},{id:"s248",name:"呼和浩特",type:"city",idx:"H",pid:"s17"},{id:"s249",name:"阿拉善盟",type:"city",idx:"A",pid:"s17"},{id:"s250",name:"包头",type:"city",idx:"B",pid:"s17"},{id:"s251",name:"巴彦淖尔",type:"city",idx:"B",pid:"s17"},{id:"s252",name:"赤峰",type:"city",idx:"C",pid:"s17"},{id:"s253",name:"鄂尔多斯",type:"city",idx:"E",pid:"s17"},{id:"s254",name:"呼伦贝尔",type:"city",idx:"H",pid:"s17"},{id:"s255",name:"通辽",type:"city",idx:"T",pid:"s17"},{id:"s256",name:"乌海",type:"city",idx:"W",pid:"s17"},{id:"s257",name:"乌兰察布",type:"city",idx:"W",pid:"s17"},{id:"s258",name:"锡林郭勒盟",type:"city",idx:"X",pid:"s17"},{id:"s259",name:"兴安盟",type:"city",idx:"X",pid:"s17"},{id:"s260",name:"银川",type:"city",idx:"Y",pid:"s18"},{id:"s261",name:"固原",type:"city",idx:"G",pid:"s18"},{id:"s262",name:"石嘴山",type:"city",idx:"S",pid:"s18"},{id:"s263",name:"吴忠",type:"city",idx:"W",pid:"s18"},{id:"s264",name:"中卫",type:"city",idx:"Z",pid:"s18"},{id:"s265",name:"西宁",type:"city",idx:"X",pid:"s19"},{id:"s266",name:"果洛州",fullName:"果洛藏族自治州",type:"city",idx:"G",pid:"s19"},{id:"s267",name:"海东地区",type:"city",idx:"X",pid:"s19"},{id:"s268",name:"海北州",fullName:"海北藏族自治州",type:"city",idx:"H",pid:"s19"},{id:"s269",name:"海南州",fullName:"海南藏族自治州",type:"city",idx:"H",pid:"s19"},{id:"s270",name:"海西州",fullName:"海西蒙古族藏族自治州",type:"city",idx:"H",pid:"s19"},{id:"s271",name:"黄南州",fullName:"黄南藏族自治州",type:"city",idx:"H",pid:"s19"},{id:"s272",name:"玉树州",fullName:"玉树藏族自治州",type:"city",idx:"Y",pid:"s19"},{id:"s273",name:"济南",type:"city",idx:"J",pid:"s20"},{id:"s274",name:"滨州",type:"city",idx:"B",pid:"s20"},{id:"s275",name:"东营",type:"city",idx:"D",pid:"s20"},{id:"s276",name:"德州",type:"city",idx:"D",pid:"s20"},{id:"s277",name:"菏泽",type:"city",idx:"H",pid:"s20"},{id:"s278",name:"济宁",type:"city",idx:"J",pid:"s20"},{id:"s279",name:"莱芜",type:"city",idx:"L",pid:"s20"},{id:"s280",name:"聊城",type:"city",idx:"L",pid:"s20"},{id:"s281",name:"临沂",type:"city",idx:"L",pid:"s20"},{id:"s282",name:"青岛",type:"city",idx:"Q",pid:"s20"},{id:"s283",name:"日照",type:"city",idx:"R",pid:"s20"},{id:"s284",name:"泰安",type:"city",idx:"T",pid:"s20"},{id:"s285",name:"威海",type:"city",idx:"W",pid:"s20"},{id:"s286",name:"潍坊",type:"city",idx:"W",pid:"s20"},{id:"s287",name:"烟台",type:"city",idx:"Y",pid:"s20"},{id:"s288",name:"枣庄",type:"city",idx:"Z",pid:"s20"},{id:"s289",name:"淄博",type:"city",idx:"Z",pid:"s20"},{id:"s290",name:"太原",type:"city",idx:"T",pid:"s21"},{id:"s291",name:"长治",type:"city",idx:"C",pid:"s21"},{id:"s292",name:"大同",type:"city",idx:"D",pid:"s21"},{id:"s293",name:"晋城",type:"city",idx:"J",pid:"s21"},{id:"s294",name:"晋中",type:"city",idx:"J",pid:"s21"},{id:"s295",name:"临汾",type:"city",idx:"L",pid:"s21"},{id:"s296",name:"吕梁",type:"city",idx:"L",pid:"s21"},{id:"s297",name:"朔州",type:"city",idx:"S",pid:"s21"},{id:"s298",name:"忻州",type:"city",idx:"X",pid:"s21"},{id:"s299",name:"阳泉",type:"city",idx:"Y",pid:"s21"},{id:"s300",name:"运城",type:"city",idx:"Y",pid:"s21"},{id:"s301",name:"西安",type:"city",idx:"X",pid:"s22"},{id:"s302",name:"安康",type:"city",idx:"A",pid:"s22"},{id:"s303",name:"宝鸡",type:"city",idx:"B",pid:"s22"},{id:"s304",name:"汉中",type:"city",idx:"H",pid:"s22"},{id:"s305",name:"商洛",type:"city",idx:"S",pid:"s22"},{id:"s306",name:"铜川",type:"city",idx:"T",pid:"s22"},{id:"s307",name:"渭南",type:"city",idx:"W",pid:"s22"},{id:"s308",name:"咸阳",type:"city",idx:"X",pid:"s22"},{id:"s309",name:"延安",type:"city",idx:"Y",pid:"s22"},{id:"s310",name:"榆林",type:"city",idx:"Y",pid:"s22"},{id:"s311",name:"成都",type:"city",idx:"C",pid:"s23"},{id:"s312",name:"阿坝州",fullName:"阿坝藏族羌族自治州",type:"city",idx:"C",pid:"s23"},{id:"s313",name:"巴中",type:"city",idx:"B",pid:"s23"},{id:"s314",name:"达州",type:"city",idx:"D",pid:"s23"},{id:"s315",name:"德阳",type:"city",idx:"D",pid:"s23"},{id:"s316",name:"甘孜州",fullName:"甘孜藏族自治州",type:"city",idx:"G",pid:"s23"},{id:"s317",name:"广安",type:"city",idx:"G",pid:"s23"},{id:"s318",name:"广元",type:"city",idx:"G",pid:"s23"},{id:"s319",name:"乐山",type:"city",idx:"L",pid:"s23"},{id:"s320",name:"凉山州",fullName:"凉山彝族自治州",type:"city",idx:"L",pid:"s23"},{id:"s321",name:"泸州",type:"city",idx:"L",pid:"s23"},{id:"s322",name:"南充",type:"city",idx:"N",pid:"s23"},{id:"s323",name:"眉山",type:"city",idx:"M",pid:"s23"},{id:"s324",name:"绵阳",type:"city",idx:"M",pid:"s23"},{id:"s325",name:"内江",type:"city",idx:"N",pid:"s23"},{id:"s326",name:"攀枝花",type:"city",idx:"P",pid:"s23"},{id:"s327",name:"遂宁",type:"city",idx:"S",pid:"s23"},{id:"s328",name:"雅安",type:"city",idx:"Y",pid:"s23"},{id:"s329",name:"宜宾",type:"city",idx:"Y",pid:"s23"},{id:"s330",name:"资阳",type:"city",idx:"Z",pid:"s23"},{id:"s331",name:"自贡",type:"city",idx:"Z",pid:"s23"},{id:"s332",name:"拉萨",type:"city",idx:"L",pid:"s24"},{id:"s333",name:"阿里地区",type:"city",idx:"A",pid:"s24"},{id:"s334",name:"昌都地区",type:"city",idx:"C",pid:"s24"},{id:"s335",name:"林芝地区",type:"city",idx:"L",pid:"s24"},{id:"s336",name:"那曲地区",type:"city",idx:"N",pid:"s24"},{id:"s337",name:"日喀则地区",type:"city",idx:"R",pid:"s24"},{id:"s338",name:"山南地区",type:"city",idx:"S",pid:"s24"},{id:"s339",name:"乌鲁木齐",type:"city",idx:"W",pid:"s25"},{id:"s340",name:"阿拉尔",type:"city",idx:"A",pid:"s25"},{id:"s341",name:"阿克苏地区",type:"city",idx:"A",pid:"s25"},{id:"s342",name:"阿勒泰地区",type:"city",idx:"A",pid:"s25"},{id:"s343",name:"巴音郭楞",fullName:"巴音郭楞蒙古自治州",type:"city",idx:"B",pid:"s25"},{id:"s344",name:"博尔塔拉州",fullName:"博尔塔拉蒙古自治州",type:"city",idx:"B",pid:"s25"},{id:"s345",name:"昌吉州",fullName:"昌吉回族自治州",type:"city",idx:"C",pid:"s25"},{id:"s346",name:"哈密地区",type:"city",idx:"H",pid:"s25"},{id:"s347",name:"和田地区",type:"city",idx:"H",pid:"s25"},{id:"s348",name:"喀什地区",type:"city",idx:"K",pid:"s25"},{id:"s349",name:"克拉玛依",type:"city",idx:"K",pid:"s25"},{id:"s350",name:"克孜勒苏州",fullName:"克孜勒苏柯尔克孜自治州",type:"city",idx:"K",pid:"s25"},{id:"s351",name:"石河子",type:"city",idx:"S",pid:"s25"},{id:"s352",name:"塔城地区",type:"city",idx:"T",pid:"s25"},{id:"s353",name:"图木舒克",type:"city",idx:"T",pid:"s25"},{id:"s354",name:"吐鲁番地区",type:"city",idx:"T",pid:"s25"},{id:"s355",name:"五家渠",type:"city",idx:"W",pid:"s25"},{id:"s356",name:"伊犁州",fullName:"伊犁哈萨克自治州",type:"city",idx:"Y",pid:"s25"},{id:"s357",name:"昆明",type:"city",idx:"K",pid:"s26"},{id:"s358",name:"保山",type:"city",idx:"B",pid:"s26"},{id:"s359",name:"楚雄州",fullName:"楚雄彝族自治州",type:"city",idx:"C",pid:"s26"},{id:"s360",name:"大理州",fullName:"大理白族自治州",type:"city",idx:"D",pid:"s26"},{id:"s361",name:"德宏州",fullName:"德宏傣族景颇族自治州",type:"city",idx:"D",pid:"s26"},{id:"s362",name:"迪庆州",fullName:"迪庆藏族自治州",type:"city",idx:"D",pid:"s26"},{id:"s363",name:"红河州",fullName:"红河哈尼族彝族自治州",type:"city",idx:"H",pid:"s26"},{id:"s364",name:"丽江",type:"city",idx:"L",pid:"s26"},{id:"s365",name:"临沧",type:"city",idx:"L",pid:"s26"},{id:"s366",name:"怒江州",fullName:"怒江傈僳族自治州",type:"city",idx:"N",pid:"s26"},{id:"s367",name:"普洱",type:"city",idx:"P",pid:"s26"},{id:"s368",name:"曲靖",type:"city",idx:"Q",pid:"s26"},{id:"s369",name:"昭通",type:"city",idx:"Z",pid:"s26"},{id:"s370",name:"文山",fullName:"文山壮族苗族自治州",type:"city",idx:"W",pid:"s26"},{id:"s371",name:"西双版纳",fullName:"西双版纳傣族自治州",type:"city",idx:"X",pid:"s26"},{id:"s372",name:"玉溪",type:"city",idx:"Y",pid:"s26"},{id:"s373",name:"杭州",type:"city",idx:"H",pid:"s27"},{id:"s374",name:"湖州",type:"city",idx:"H",pid:"s27"},{id:"s375",name:"嘉兴",type:"city",idx:"J",pid:"s27"},{id:"s376",name:"金华",type:"city",idx:"J",pid:"s27"},{id:"s377",name:"丽水",type:"city",idx:"L",pid:"s27"},{id:"s378",name:"宁波",type:"city",idx:"N",pid:"s27"},{id:"s379",name:"衢州",type:"city",idx:"Q",pid:"s27"},{id:"s380",name:"绍兴",type:"city",idx:"S",pid:"s27"},{id:"s381",name:"台州",type:"city",idx:"T",pid:"s27"},{id:"s382",name:"温州",type:"city",idx:"W",pid:"s27"},{id:"s383",name:"舟山",type:"city",idx:"Z",pid:"s27"},{id:"s384",name:"台湾",type:"city",idx:"T"},{id:"s385",name:"香港",type:"city",idx:"X"},{id:"s386",name:"澳门",type:"city",idx:"A"},{id:"s387",name:"北京",type:"city",idx:"B"},{id:"s388",name:"上海",type:"city",idx:"S"},{id:"s389",name:"天津",type:"city",idx:"T"},{id:"s390",name:"重庆",type:"city",idx:"C"}],
                cityCollection,//根据字母来排序的城市数组
                myExports = {};

            function init(){
                adaptBaiduData();
                var cities = _.filter(baiduCityData,function(each){return each.type == "city"});
                cityCollection = _.groupBy(cities,function(each){return each.idx});
//                console.log(myExports.getCitiesByFirstLetter("a"));
            }
            //
            function adaptBaiduData(){
                 _.each(baiduCityData,function(each){
                    if(each.fullName == undefined){
                        if(each.type == "prov"){
                            each.fullName = each.name + "省";
                        }else if(each.type == "city"){
//                            each.fullName = each.name + "市";//有的数据加市很奇怪，所以不加
                            each.fullName = each.name;
                        }
                    }
                });
            }
            //
            myExports.getCitiesByFirstLetter = function(letter,hasLabel){
                letter = letter.toUpperCase();
                if(hasLabel){
                    var data = {};
                    data[letter]=cityCollection[letter];
                    return data;
                }else{
                    return cityCollection[letter];
                }

            };
            // a..f
            myExports.getCitiesByLetterRange = function(letterRange){
              var rangeRex = /([a-zA-z])\.\.([a-zA-z])/,
                  alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                  matchRes = rangeRex.exec(letterRange),
                  startAlpha,
                  ennAlpha,
                  startIndex,
                  endIndex,
                  rangStr,
                  resArr = [],
                  self = this;
                if(matchRes && matchRes[1] != undefined && matchRes[2] != undefined){
                    startAlpha = matchRes[1].toUpperCase();
                    ennAlpha = matchRes[2].toUpperCase();
                    startIndex = alphas.index(startAlpha);
                    endIndex = alphas.index(ennAlpha)+1;
                    if(startIndex < endIndex){
                        rangStr = alphas.substr(startIndex,endIndex);
                        rangStr.split().forEach(function(each){
                            resArr.push(self.getCitiesByFirstLetter[each]);
                        });
                        return resArr;
                    }else{
                        throw "getCitiesByLetterRange: error param";
                    }
                }else{
                    throw "getCitiesByLetterRange: error param";
                }


            };
            myExports.getAllCityLettersArr = function(){
                var letterArr =[];
                _.forEach(cityCollection,function(each){
                   letterArr.push(each[0].idx);
                });
                letterArr = _.uniq(letterArr);//去重
                letterArr = _.sortBy(letterArr,function(each){return each}); //排序 按ABC...Z的顺序排
                return letterArr;
            };
            myExports.getAllCities = function(){
                return cityCollection;
            }



            init();
            return myExports;

        })(_);
    };
    function initModule(){

    };

    function registerMapSearchEvent(){
        var uInputWrap = fish.one(".searchInputPanel"),
            uStartInput = fish.one(".startPlace input",uInputWrap),
            uEndInput = fish.one(".endPlace input",uInputWrap),
            uCityPickerWrap = fish.one(".cityPickWrap",uInputWrap),
            uCityPicker = fish.one(".pickedCity",uCityPickerWrap),
            uCities = fish.one(".citysWrap",uCityPickerWrap),
            uCityPickerIcon = fish.one(".pickedCityIcon",uCityPickerWrap),
            uCitiesCont = fish.one(".citiesWrap",uCities),
            uPickedCity = fish.one(".pickedCity",uCityPickerWrap),
            uSwitchCity = fish.one(".switchIcon",uInputWrap),
            uSearchBtn = fish.one(".searchMapBtn",uInputWrap);
        ;

        uInputWrap.hover(function(){
            activeSearchInput();
        },function(){
            inactiveSearchInput();
        });
        //placeHolder
        initPlaceHolder(uStartInput);
        initPlaceHolder(uEndInput);
        //城市选择框
        uCityPicker.on("click",function(){
            uCities.removeClass("none");
            uCityPickerIcon.addClass("statusOpen");

        });
        //查询结果
        uCityPickerIcon.on("click",function(){
            uCities.removeClass("none");
            uCityPickerIcon.addClass("statusOpen");

        });
        //城市选择框的消显
        var uCityNameHidden = fish.one("#cityName"),
            uCityFullNameHidden = fish.one("#cityFullName");
//        fish.one(document).on("click",function(evt){
        fish.one("body").on("click",function(evt){
            var uTar = fish.one(fish.getTarget(evt)),
                uNavTar;
            if(!uTar.hasClass("cityPickWrap") && uTar.getParent(".cityPickWrap").length == 0){
                //点击部位城市选择框外面
                uCities.addClass("none");
                uCityPickerIcon.removeClass("statusOpen");
            }else{
                //移动滚动条 dom.scrollTop = ...
                if(uTar.hasClass("cityNav")){
                    uNavTar = fish.one(uTar.attr("data-tarId"),uCities);
                    uCitiesCont[0].scrollTop = getScrollTop(uNavTar,uCitiesCont);
                }else if(uTar.hasClass("cityItem")){
                    uPickedCity.html(uTar.attr("data-fullName"));
                    uCityFullNameHidden.val(uTar.attr("data-fullName"));
                    uPickedCity.attr("data-cityName",uTar.html());
                    uCityNameHidden.val(uTar.html());
                    uCities.addClass("none");
                    uCityPickerIcon.removeClass("statusOpen");
                    window.publish("seacrchMapConditionChange");
                    //
                    mapModule.initMap({
                        cityName:getSearchConditionObj().cityName,
                        initMapUseCity:true
                    });
                    //重置autocomplete的城市
                    startInputAutoComplete.setLocation(getSearchCondition("cityName"));
                    endInputAutoComplete.setLocation(getSearchCondition("cityName"));


                }
            }

        });

        function getScrollTop(uTar,uWrap){
           return uTar.offset(uWrap).top + uWrap.scrollTop();
        }


        //出发结束地点交换
        uSwitchCity.on("click",function(){
            var temp = uStartInput.val();
            if((fish.trim(uStartInput.val()) == ""
                || fish.trim(uStartInput.val()) == uStartInput.attr("data-placeholder"))
                &&(fish.trim(uEndInput.val()) == ""
                || fish.trim(uEndInput.val()) == uEndInput.attr("data-placeholder")
                )){
                startInputAutoComplete.setInputValue(uStartInput.attr("data-placeholder"));
                endInputAutoComplete.setInputValue(uEndInput.attr("data-placeholder"));
            }else if((fish.trim(uStartInput.val()) == ""
                || fish.trim(uStartInput.val()) == uStartInput.attr("data-placeholder"))
                &&!(fish.trim(uEndInput.val()) == ""
                || fish.trim(uEndInput.val()) == uEndInput.attr("data-placeholder")
                )){//终点非空
                startInputAutoComplete.setInputValue(uEndInput.val());
                endInputAutoComplete.setInputValue(uEndInput.attr("data-placeholder"));

            }else if(!(fish.trim(uStartInput.val()) == ""
                || fish.trim(uStartInput.val()) == uStartInput.attr("data-placeholder"))
                &&(fish.trim(uEndInput.val()) == ""
                || fish.trim(uEndInput.val()) == uEndInput.attr("data-placeholder")
                )){//起点非空
                endInputAutoComplete.setInputValue(uStartInput.val());
                startInputAutoComplete.setInputValue(uStartInput.attr("data-placeholder"));
            }else
            {
                startInputAutoComplete.setInputValue(uEndInput.val());
                endInputAutoComplete.setInputValue(temp);
            }

            window.publish("seacrchMapConditionChange");
        });


        uStartInput.on("change",function(){
            window.publish("seacrchMapConditionChange");
        });
        uEndInput.on("change",function(){
            window.publish("seacrchMapConditionChange");
        });
        //搜索
        uSearchBtn.on("click",function(){
            if(getSearchCondition("searchJump") != "true"){//在本页面搜索
                window.publish("searchMap");
            }

        });



        //激活search框时view的变化
        function activeSearchInput(){
            uInputWrap.addClass("seachInputPanelActive");
        };

        function inactiveSearchInput(){
            uInputWrap.removeClass("seachInputPanelActive");
        };
        //绑定autocomplele
        initAutoCompleteInputs();


    };
    function mapConditionChanged(){
        var uDataBase = fish.one("#dataBase");
        uDataBase.attr("data-startPlace",fish.one(".searchInputPanel .startPlace input").val());
        uDataBase.attr("data-endPlace",fish.one(".searchInputPanel .endPlace input").val());
        uDataBase.attr("data-cityFullName",fish.one(".searchInputPanel .pickedCity").html());
        uDataBase.attr("data-cityName",fish.one(".searchInputPanel .pickedCity").attr("data-cityName"));
    };

    function searchMap(param){
        //重置选择条件
        setSearchCondition("hasChooseStart",false);
        setSearchCondition("hasChooseEnd",false);
        var startPlace = getSearchConditionObj().startPlace,
            endPlace = getSearchConditionObj().endPlace,
            startPlaceShowName,
            endPlaceShowName,
            canSearch = true,
            uSomeNav = fish.one(".map_right_e");//一些广告
//        uSomeNav.addClass("none");//隐藏广告。广告只在还没搜索的时候展示
        if(startPlace == "" || startPlace == fish.one(".startPlace input").attr("data-placeHolder") || endPlace == "" || endPlace == fish.one(".endPlace input").attr("data-placeHolder")){
            canSearch = false;
        }
        if(param && param.condition === "point"){//用点（经纬度）来搜索
            startPlaceShowName = startPlace;
            endPlaceShowName = endPlace;
            if(param.isStrPoint){
                startPlaceShowName = param.startPlaceShowName;
                endPlaceShowName = param.endPlaceShowName;
                startPlace = new BMap.Point(param.startPoint.split(",")[0],param.startPoint.split(",")[1]);
                endPlace = new BMap.Point(param.endPoint.split(",")[0],param.endPoint.split(",")[1]);
            }else{
                startPlace = points[parseInt(getSearchCondition("startPointIndex"))];
                endPlace = points[parseInt(getSearchCondition("endPointIndex"))];
            }

        }

        if(canSearch){
            searchTrav(mapModule,{
                startPlace:startPlace,
                endPlace:endPlace,
                startPlaceShowName:startPlaceShowName,
                endPlaceShowName:endPlaceShowName,
                cityName:getSearchConditionObj().cityName,
                update:true,
                policy:"lessTime",
                renderSel:".lessTimeWrap"
            });
        }

    };
    function renderBaiduCityData(data,uTemp,uElem){
        var html = fish.template(uTemp.html(),data);
        uElem.html(html);
    };
    //画查询结果
    function drawTravRes(results,param,renderSel){
        if(param.isFind){//查找到公交换乘方案
            drawTravPlans(results,param,renderSel);
        }else{//未查找到,提供提示
            drawPlanSuggestion(results,param,renderSel);

        }


    };
    //画公交换乘方案
    function drawTravPlans(results,param,renderSel){
        var resPanelSel = renderSel,
            uSuggestWrap = fish.one(".chooseRouteWrap"),
            map = param.map,
            startPlace = param.startPlace,
            endPlace = param.endPlace,
            uResPanel = fish.one(resPanelSel),
            planLength = results.getNumPlans(),
            taxiStr,
            backBtnStr = "<a href='javascript:void(0);' title='' class='viewReturnBtn'>路线返程</a>",
            plansStrArr = [],
            uTravWrap = fish.one(".policyTabWrap"),
            uTaxPriceWrap = fish.one(".taxiFare"),
            uTaxPrice = fish.one(".outstand",uTaxPriceWrap),
            taxPrice = getTaxiPrice(results);
        //当前显示，地址提示的消隐
        uTravWrap.removeClass("none");
        uSuggestWrap.addClass("none");

        window.mapInfoObj.map = map;
        _(planLength).times(
            function(index){
                var eachPlan = results.getPlan(index);
                plansStrArr.push(getPlanStr(eachPlan,index,startPlace,endPlace));
            }
        );
        //有打车价格的
        if(taxPrice){
            uTaxPrice.html(taxPrice);
            uTaxPriceWrap.removeClass("none");
        }else{
            uTaxPriceWrap.addClass("none");
        }

        uResPanel.html(plansStrArr.join(""));
    }
    //画地点提示方案
    function drawPlanSuggestion(results,param){
        var suggestNum = results.getCurrentNumPois(),
            isStartPlace = param.type === "startPlace",
            data = {
                suggestionsArr:[]
            },
            renderSel,
            uRenderWrap,
            tempStr,
            uSuggestWrap = fish.one(".chooseRouteWrap"),
            uTravWrap = fish.one(".policyTabWrap");
        //当前显示，公交线路的消隐
        uTravWrap.addClass("none");
        uSuggestWrap.removeClass("none");
        if(isStartPlace){//起点提示
            data.place = param.startPlace;
            renderSel = ".chooseRouteWrap .chooseStartPlaceWrap";
            data.showStatusIcon = false;//起点不需要展开，收起
            data.buttonText = "选为起点";
            data.buttonClassName = "chooseStartPlaceBtn";

        }else{//终点提示
            data.place = param.endPlace;
            renderSel = ".chooseRouteWrap .chooseEndPlaceWrap";
            data.showStatusIcon = true;
            data.buttonText = "选为终点";
            data.buttonClassName = "chooseEndPlaceBtn";
        }
        uRenderWrap = fish.one(renderSel);
        if(suggestNum!==0){
            data.suggestType = "questionBar";// notFindBar,findBar,questionBar
            tempStr = fish.one("#suggestContTempl").html();
            _(suggestNum).times(function(i){
                var eachSuggestion = results.getPoi(i),
                    pointIndex = points.length,
                    eachSuggestData = {
                        name:eachSuggestion.title,
                        address:eachSuggestion.address,
                        pointIndex:pointIndex
                    };
                points.push(eachSuggestion.point);

                data.suggestionsArr.push(eachSuggestData);
            });
        }else{//未找到提示数据
            data.suggestType = "notFindBar";
            tempStr = fish.one("#suggestNotFindTempl").html();
            data.cityName = getSearchConditionObj().cityName;

        }
        tempStr = fish.template(tempStr,data);
        uRenderWrap.html(tempStr);
    }
    function registerMapEvent(){
        var uAllTabHeadItem = fish.all(".mapResPanel .tabHeader li"),
            uAllTabContItem = fish.all(".mapResPanel .tabCont li"),
            uResWrap = fish.one("#searchBusResMap"),
            uStartInput = fish.one(".startPlace input"),
            uEndInput = fish.one(".endPlace input"),
            uMapResPanel = fish.one(".mapResPanel"),
            uStatusCtrlBtn = fish.one(".mapResPanelStatusCtrlBtn",uMapResPanel),
            isIe6 = fish.browser("ms",6),
            uQueryReturnBtn = fish.one("#searchBusResMap .queryReturnBtn");

//        查询结果的收拢展开
        uStatusCtrlBtn.on("click",function(){
            //处于收拢状态
            if(uMapResPanel.hasClass("mapResPanelStatusClose")){
                uMapResPanel.removeClass("mapResPanelStatusClose");
                if(isIe6){
                    fish.all(".mapResPanel-head,#searchBusResMap",uMapResPanel).removeClass("none");
                }

            }else{//处于展开状态
                uMapResPanel.addClass("mapResPanelStatusClose");
                if(isIe6){
                    fish.all(".mapResPanel-head,#searchBusResMap",uMapResPanel).addClass("none");
                }
            }
        });
        //某种策略 tab
        uAllTabHeadItem.on("click",function(evt){
           var uThis = fish.one(this),
               uTar = fish.one(fish.getTarget(evt)),
               tarTabContClassName,
               startPlace,
               endPlace,
               uTarTabCont;

            if(!uThis.hasClass("at")){
                uAllTabHeadItem.removeClass("at");
                uThis.addClass("at");
                uAllTabContItem.removeClass("at");
                tarTabContClassName = uThis.attr("data-index");
                uTarTabCont = fish.all(".mapResPanel .tabCont ."+tarTabContClassName);
                uTarTabCont.addClass("at");
                if(getSearchCondition("searchJump") == "true"){//不在本页搜索
                    startPlace = initStartPlace;
                    endPlace = initEndPlace;
                }else{
                    startPlace = getSearchConditionObj().startPlace;
                    endPlace = getSearchConditionObj().endPlace;
                }
                searchTrav(mapModule,{
                    startPlace:startPlace,
                    endPlace:endPlace,
                    policy:uThis.attr("data-policy"),
                    renderSel:uThis.attr("data-renderSel"),
                    update:false
                });
            }


        });
//        点某一条线路
        uAllTabContItem.on("click",function(evt){
            var uTar = fish.one(fish.getTarget(evt));
            if(uTar.getParent(".isLine").length >0){
                uTar = uTar.getParent(".isLine");
            }
            // click每段线路时 调整适口
            if(uTar.hasClass("isLine") && uTar.attr("data-lineId") != undefined ){
                if(uTar.hasClass("multiLine")){
                    adjustViewport(uTar.attr("data-boundId"),true);
                }else{
                    adjustViewport(uTar.attr("data-lineId"),false);
                }

            }
        });

//        展开收起某个乘车计划，小箭头 以及outline
        uAllTabContItem.on("click",function(evt){
            var uTar = fish.one(fish.getTarget(evt)),
                isOutline = false,
                uArrow,
                uPlan,
                uAllPlan = fish.all(".eachPlane",this);
            if(!uTar.hasClass("ctrlArrow")){
                if(uTar.hasClass("outlineWrap")){
                    isOutline = true;
                }else if(uTar.getParent(".outlineWrap")){
                    uTar = uTar.getParent(".outlineWrap");
                    isOutline = true;
                }else{
                    return;
                }
            }
            if(uTar.hasClass("ctrlArrow") || isOutline){
                uPlan = uTar.getParent(".eachPlane");
                uArrow = fish.one(".ctrlArrow",uPlan);
                //必须有一个outline是展开的，所有点outline不会收起
                if(uPlan.hasClass("detailOpen")&&!isOutline){
                    uPlan.removeClass("detailOpen");
                    uPlan.addClass("detailClose");
                    uArrow.attr("title","展开");
                }else if(uPlan.hasClass("detailClose")){
                    uAllPlan.each(function(){
                       var uThis = fish.one(this),
                           uArrow = fish.one(".ctrlArrow",this);
                        uThis.removeClass("eachPlaneHover");
                        uThis.removeClass("detailOpen");
                        uThis.addClass("detailClose");
                        uArrow.attr("title","展开");
                    });
                    uPlan.removeClass("detailClose");
                    uPlan.addClass("detailOpen");
                    uArrow.attr("title","收起");
                }
            }
        });

        //选为起点，选为终点按钮
        uResWrap.on("click",function(evt){
            var uThis = fish.one(this),
                uTar = fish.one(fish.getTarget(evt)),
                uTitleBar,
                uTitle,
                placeName,
                pointIndex;
            if(uTar.hasClass("choosePlaceBtn")){
                uTitleBar = fish.one(".chooseTitle",uTar.getParent(".choosePlaceWrap"));
                uTitle = fish.one("dd",uTitleBar);
                uTitleBar.addClass("findBar");
                placeName = uTar.attr("data-palceName");
                pointIndex = uTar.attr("data-pointIndex");
                uTitle.html(placeName);
                if(uTar.hasClass("chooseStartPlaceBtn")){
                    setSearchCondition("hasChooseStart","true");
                    //设置起点的经纬度 的index
                    setSearchCondition("startPointIndex",pointIndex);
//                    uStartInput.val(placeName);//这样会导致autocomplete的出现
                    startInputAutoComplete.setInputValue(placeName);

                }else{
                    setSearchCondition("hasChooseEnd","true");
                    //设置终点的经纬度
                    setSearchCondition("endPointIndex",pointIndex);
                    endInputAutoComplete.setInputValue(placeName);
                }

                window.publish("seacrchMapConditionChange");
                if(allChoose()){//起点和终点都选择了。
                    publish("searchMap",{condition:"point"});
                }else{
                    //展开没选的
                    if(getSearchCondition("hasChooseStart") != "true"){//展开开始，收起结束
                        fish.one(".chooseStartPlaceWrap").addClass("nowShow");
                        fish.one(".chooseEndPlaceWrap").removeClass("nowShow");
                    }else{
                        fish.one(".chooseEndPlaceWrap").addClass("nowShow");
                        fish.one(".chooseStartPlaceWrap").removeClass("nowShow");
                    }
                }

            }

        });
        //
        function allChoose(){
            var flag = false;
            if(getSearchCondition("hasChooseStart") == "true"&&getSearchCondition("hasChooseEnd") == "true"){
                flag = true;
            }
            return flag;
        };

        //查看往返线路
        uQueryReturnBtn.on("click",function(){
            var temp = uStartInput.val();
            startInputAutoComplete.setInputValue(uEndInput.val());
            endInputAutoComplete.setInputValue(temp);
            window.publish("seacrchMapConditionChange");
            if(getSearchCondition("searchJump") == "false"){
                window.publish("searchMap");
            }

        });
        uQueryReturnBtn.hover(function(){
            uQueryReturnBtn.addClass("queryReturnBtn-hover");
        },function(){
            uQueryReturnBtn.removeClass("queryReturnBtn-hover");
        });


    };
    //一些不能委托的事件，如 hover
    function registerEventAfterPainting(isFind){
        if(isFind){//查找到公交解决方案
            var uInputWrap = fish.one(".searchInputPanel");

            fish.all(".isLine").hover(function(){
                var uThis = fish.one(this);
                if(uThis.hasClass("walkLine")){//步行：步行和非步行的画的样式有区别
                    this.path = drawPath(uThis.attr("data-lineId"),true,true);
                }else{
                    this.path = drawPath(uThis.attr("data-lineId"),true,false);
                }

            },function(){
                var uThis = fish.one(this);
                removePath(this.path);
            });

            //hover某plan
            fish.all(".eachPlane").hover(function(){
                var uThis = fish.one(this);
                if(uThis.hasClass("detailClose")){
                    uThis.addClass("eachPlaneHover");
                }
            },function(){
                var uThis = fish.one(this);
                uThis.removeClass("eachPlaneHover");
            });
            //hover某段线路
            fish.all(".borderWrap").hover(function(){
                var uThis = fish.one(this),
                    uLine = fish.one(".isLine",uThis);
                if(uLine.length>0){
                    uThis.addClass("hoverEachLine");
                }
            },function(){
                var uThis = fish.one(this);
                uThis.removeClass("hoverEachLine");
            });


        }else{//未查找到
            //建议的hover
            fish.all("#searchBusResMap .chooseRouteWrap .chooseItem").hover(function(){
                var uThis = fish.one(this),
                    index = uThis.attr("data-index"),
                    uMapIcon = fish.one("#searchBusMap ." +"index" + index),
                    uMapIconWrap = uMapIcon.getParent(".mapMarkerIconWrap");

                uThis.addClass("chooseItemHover");
                uMapIconWrap.addClass("hoverMapIcon");
                //
            },function(){
                var uThis = fish.one(this),
                    index = uThis.attr("data-index"),
                    uMapIcon = fish.one("#searchBusMap ." +"index" + index),
                    uMapIconWrap = uMapIcon.getParent(".mapMarkerIconWrap");;
                uThis.removeClass("chooseItemHover");
                uMapIconWrap.removeClass("hoverMapIcon");
            });
            var uAllChoseWrap = fish.all("#searchBusResMap .choosePlaceWrap");
           //建议的头的展开合拢操作
            fish.all("#searchBusResMap .choosePlaceWrap .chooseTitle").on("click",function(){
                var uThis = fish.one(this),
                    palce = uThis.attr("data-place"),
                    uPlaceWrap = uThis.getParent(".choosePlaceWrap"),
                    uTitleBar;
                if(!uPlaceWrap.hasClass("nowShow")){//处于收拢状态
                    uAllChoseWrap.removeClass("nowShow");
                    uPlaceWrap.addClass("nowShow");
                    uTitleBar = fish.one(".chooseTitle",uPlaceWrap);
                    uTitleBar.removeClass("findBar");
                    //搜索
                    mapModule.localSearch({
                        cityName:getSearchConditionObj().cityName,
                        place:palce,
                        update:true
                    });
                }

            });

        }


    };
    function searchTrav(mapModule,param){
        var isGivePlaceSuggestion = getSearchCondition("givePlaceSuggestion") == "true" ? true : false,
            isupdateSelectedTab = param.update,
            uSomeNav = fish.one(".map_right_e");//一些广告

        //正在查询
        fish.mPop({
            content:fish.one("#loadingWrap"),
            overlay:false
        });
        mapModule.travSearch({
            startPlace:param.startPlace,
            endPlace:param.endPlace,
            startPlaceShowName:param.startPlaceShowName,
            endPlaceShowName:param.endPlaceShowName,
            policy:param.policy,
            cityName:param.cityName,
            update:param.update,
            givePlaceSuggestion:isGivePlaceSuggestion,
            completeCallback:function(results,callBackParam){
                uSomeNav.addClass("none");//隐藏广告。广告只在还没搜索的时候展示;
                drawTravRes(results,callBackParam,param.renderSel);
                registerEventAfterPainting(callBackParam.isFind);

            },
            finalFn:function(param){
                uSomeNav.addClass("none");//隐藏广告。广告只在还没搜索的时候展示;
                fish.mPop && fish.mPop.close();
                if(param.isReallyNotFind){//用点到点，也查不到，那么则提示查不到
                    fish.one("#searchBusResMap .policyTabWrap").addClass("none");
                    fish.one("#searchBusResMap .chooseRouteWrap").addClass("none");
                    if(param.tooNear){//两点距离太近，建议步行前往
                        fish.one("#searchBusResMap .cantFindBusRoute").html(
                            _.template("<span class='outstand'>“<%=startPlace %>” </span> 到 <span class='outstand'>“<%=endPlace %>”</span>的距离较近，建议步行前往。",{startPlace:param.startPlace,endPlace:param.endPlace}));
                    }else{
                        fish.one("#searchBusResMap .cantFindBusRoute").html(
                            _.template("非常抱歉，未能找到从<span class='outstand'>“<%=startPlace %>” </span> 到 <span class='outstand'>“<%=endPlace %>”</span>的公交路线。",{startPlace:param.startPlace,endPlace:param.endPlace}));
                    }


                }
                if(isupdateSelectedTab){
                    fish.all(".policyTabWrap .tabHeader li").removeClass("at");
                    fish.one(fish.all(".policyTabWrap .tabHeader li")[0]).addClass("at");
                    fish.all(".policyTabWrap .tabCont li").removeClass("at");
                    fish.one(".policyTabWrap .tabCont .lessTimeWrap").addClass("at");
                }
                //打开第一个
                if(!isGivePlaceSuggestion && param && param.isFind == false){//不进行进一步查询 则要把 地图给隐藏掉
                    fish.one(".mapWrap").addClass("none");
                }
            }


        });


    };
    function getSearchConditionObj(){
        var uDataBase = fish.one("#dataBase"),
            searchConditionObj = {
                "startPlace":uDataBase.attr("data-startPlace"),
                "endPlace":uDataBase.attr("data-endPlace"),
                "cityName":uDataBase.attr("data-cityName"),
                "cityFullName":uDataBase.attr("data-cityFullName")
            };
        return searchConditionObj;
    };

    function getSearchCondition(conditionName){
        var uDataBase = fish.one("#dataBase");
        return uDataBase.attr("data-" + conditionName);
    }
    function setSearchCondition(conditionName,val){
        var uDataBase = fish.one("#dataBase");
        uDataBase.attr("data-" + conditionName,val);
    }
    function getPlanStr(plan,planIndex,startPlace,endPlace){
        var
            lineNum = plan.getNumLines(),//非步行 长度
            walkNum = plan.getNumRoutes(),//步行 长度
            totalPathArr = [],
            totalPathId,
            boundId,
            bound = [],//区域
            eachLine,
            eachWalk,
            eachWalkPathId,
            eachWalkPath,
            eachWalkEndPlace,
            eachNotWalkPath,
            eachNotWalkPathId,
            planStrArr= [],
            isSelected = false;
        if(planIndex == 0){
            isSelected = true;
        }
        if(isSelected){
            planStrArr.push('<div class="eachPlane atItem detailOpen">');
        }else{
            planStrArr.push('<div class="eachPlane detailClose">');
        }

        totalPathId = paths.length;
        paths.push(totalPathArr);
        boundId = bounds.length;

        //头部概要
        planStrArr.push(getOutlineStr(plan,planIndex,totalPathId,boundId));
        planStrArr.push('<div class="planDetailWrap">');
        //起点
        planStrArr.push(_.template("<div class='borderWrap'><div class='startPlaceWrap clearfix'><div class='placeWrap'><span class='placeInner'><%= startPlace %></span></div></div></div>",{"startPlace":startPlace}));
        //先步行，在交通工具，再步行，再交通工具如此循环
        _(lineNum).times(function(lineIndex){
            eachLine = plan.getLine(lineIndex);
            //步行
            if(lineIndex < walkNum){
                eachWalk = plan.getRoute(lineIndex);
                eachWalkEndPlace = eachLine.getGetOnStop().title;
                //为hover在画那线路
                eachWalkPath = [];
//                eachWalk.getPath().forEach(function(each,pathIndex){
//                    eachWalkPath.push(each);
////                    if(pathIndex < each.getStep()){
////
////                    }
//                });
                eachWalkPath = eachWalk.getPath();
                eachWalkPathId = paths.length;
                paths.push(_.clone(eachWalkPath));
                totalPathArr.push(_.clone(eachWalkPath));//总路径
                bound.push(_.clone(eachWalkPath));//总路径
                planStrArr.push(getWalkStr(eachWalk,eachWalkEndPlace,eachWalkPathId));
            }
            //非步行
            eachNotWalkPathId = paths.length;
            eachNotWalkPath = eachLine.getPath();
            paths.push(_.clone(eachNotWalkPath));
            totalPathArr.push(_.clone(eachNotWalkPath));
            bound.push(_.clone(eachNotWalkPath));

            planStrArr.push(getLineStr(eachLine,eachNotWalkPathId));

        });
        //最后一次步行
        if(walkNum > lineNum){
            eachWalk = plan.getRoute(walkNum-1);
            eachWalkEndPlace = endPlace;
            eachWalkPath = eachWalk.getPath();
            eachWalkPathId = paths.length;
            paths.push(_.clone(eachWalkPath));
            totalPathArr.push(_.clone(eachWalkPath));
            bound.push(_.clone(eachWalkPath));
            planStrArr.push(getWalkStr(eachWalk,eachWalkEndPlace,eachWalkPathId));
        }
        bound = _.flatten(bound,true);//是点的集合，里面不能嵌套数组
        bounds.push(bound);

        //终点
        planStrArr.push(_.template("<div class='borderWrap lastBorderWrap'><div class='endPlaceWrap clearfix'><div class='placeWrap'><span class='placeInner'><%= endPlace %></span></div></div></div>",{"endPlace":endPlace}));

        planStrArr.push('</div>');
        planStrArr.push('</div>');
        return planStrArr.join("");
    };
    //头部概要
    function getOutlineStr(plan,planIndex,pathId,boundId){
        var outlineTemplate = _.template(//概要
                '<div class="outlineWrap isLine multiLine" data-lineId="<%= pathId%>" data-boundId="<%= boundId%>">' +
                    '<span class="planIndexIcon mapIcon"><%= planIndex+1%></span>'+
                    '<a class="ctrlArrow" href="javascript:void(0);" title="<%= ctrlArrowTitle%>"></a>'+
                    '<div class="summaryWrap" >' +
                        '<h3 class="lineDes"><%= lineDes%></h3>'+
                        '<div class="lineDesOther">全程约:<%= duration%>/<%= distance%></div>' +
                    '</div>'+//时间 公里
                '</div>'
            ),
            outLineData = {},
            outlineStr,
            lineDesArr = [],
            lineNum = plan.getNumLines();
        outLineData.pathId = pathId;
        outLineData.boundId = boundId;
        outLineData.planIndex = planIndex;
        outLineData.duration = plan.getDuration(true);//时间
        outLineData.distance = plan.getDistance(true);//公里
        outLineData.startLineName = plan.getLine(0).title;
        if(planIndex == 1){
            outLineData.ctrlArrowTitle = "收起";
        }else{
            outLineData.ctrlArrowTitle = "展开";
        }
        //描述
        _(lineNum).times(function(lineIndex){
            if(lineIndex > 0){//不是第一条
                lineDesArr.push("→");
            }
            var eachLine = plan.getLine(lineIndex),
                lineDes = eachLine.title;
            lineDes = filterLineTitle(lineDes);
            if(eachLine.type==BMAP_LINE_TYPE_BUS&&/^\d+$/.test(lineDes)){
                lineDes += "路";
            }
            lineDesArr.push(lineDes);
        });

        outLineData.lineDes = lineDesArr.join("");

        outlineStr = outlineTemplate(outLineData);
        return outlineStr;
    };
    function filterLineTitle(str){
      if(typeof(str)!=="string"){
          throw "typeError:param:str should be string";
      }
      var filterReg = /\([\s\S]*$/;//文字描述包含在括号中，括号后面的均不要
      return str.replace(filterReg,"");
    };
    //步行
    function getWalkStr(eachWalk,startPlace,pathId){
        var walkTemplate = _.template(
            '<div class="borderWrap"><div class="walkLine isLine clearfix" data-lineId ="<%= pathId%>">' +
                '<div class="descriWrap">步行至<a class="stopPlace" href="javascript:void(0);"><%= stopPlace%></a></div>' +
                '<a class="eachTravLength" href="javascript:void(0);"><%= eachTravLength%></a></div></div>'),
            eachWalkData = {},
            walkStr = "";
        if(eachWalk.getDistance(false) > 0){//有步行，没有步行的则不打印
            eachWalkData.stopPlace = startPlace;//步行结束的站台即使公交上车的站台
            eachWalkData.eachTravLength =eachWalk.getDistance(true);//带单位
            eachWalkData.pathId = pathId;
            walkStr = walkTemplate(eachWalkData);
        }
        return walkStr;

    };
    //非步行
    function getLineStr(eachLine,pathId){
        var lineTemplate = _.template(//非步行：
            '<div class="borderWrap"><div class="<%= lineType%>Line isLine clearfix" data-lineId ="<%= pathId%>">' +
                '<div class="descriWrap">乘坐<%= travName%>，在' +
                '<a class="stopPlace" href="javascript:void(0);"><%= stopPlace%></a>下车</div>' +
                '<a class="eachTravLength" href="javascript:void(0);"><%= eachTravLength%>站</a></div></div>'),
            eachLineData = {},
            lineStr = "";
        if(eachLine.type == BMAP_LINE_TYPE_BUS ||eachLine.type == BMAP_LINE_TYPE_SUBWAY||eachLine.type == BMAP_LINE_TYPE_FERRY){
            eachLineData.stopPlace = eachLine.getGetOffStop().title;//下车站台
            eachLineData.eachTravLength = eachLine.getNumViaStops();//停靠的站数
            eachLineData.pathId = pathId;
            switch (eachLine.type){
                case BMAP_LINE_TYPE_BUS:
                    eachLineData.lineType = "bus";
                    break;
                case BMAP_LINE_TYPE_SUBWAY:
                    eachLineData.lineType = "subway";
                    break;
                case BMAP_LINE_TYPE_FERRY://轮渡
                    eachLineData.lineType = "ferry";
                    break;
                default :
                    throw "error traveType";
            }
//            eachLineData.lineType = eachLine.type;
            eachLineData.travName =  eachLine.title;
            if(eachLine.type == BMAP_LINE_TYPE_BUS){
                if(/^\d+$/.test(eachLineData.travName)){
                    eachLineData.travName = eachLineData.travName + "路";
                }
            }
            lineStr = lineTemplate(eachLineData);
        }
        return lineStr;
    };


    //打车
    function  getTaxiPrice(result){
        var price = false;
        if(result && result.taxiFare && result.taxiFare.day && result.taxiFare.day.totalFare){
            price = result.taxiFare.day.totalFare;
        }
        return price;
    }




    //
    function  drawPath(lineId,isAdjustView,isWalk){
        return ctrlLine(lineId,"add",isAdjustView,isWalk);
    }
    function  removePath(deletePath){
        ctrlLine(null,"remove",true,deletePath);
    }
    //@isAdjustView 是否自动调整视角
    function ctrlLine(pathId,operation,notAdjustView,deletePath){
        var mapInfoObj = getCurrMapInfo(),
            map = mapInfoObj.map,
            paths = mapInfoObj.paths,
            boundId,
            bounds = mapInfoObj.bounds,//区域，ajustView时有用
            pathArr,
            drawPath,
            isWalk,
            notWalkStorkeStyle ={strokeColor:"red", strokeWeight:6, strokeOpacity:0.5},
            walkStorkeStyle = {
                    strokeStyle:"dashed",
                    strokeColor:"red",
                    strokeOpacity:0.75,
                    strokeWeight:4,
                    enableMassClear:true
                },
            strokeStyle,
            addPath;
        if(operation == "add"){
            isWalk = deletePath;
            if(isWalk){
                strokeStyle = walkStorkeStyle;
            }else{
                strokeStyle = notWalkStorkeStyle;
            }
            if(_.isArray(paths[pathId]) && paths[pathId].length>0 && _.isArray(paths[pathId][0])){
                pathArr = paths[pathId];
                addPath = [];
                pathArr.forEach(function(eachPach,index){
                    var eachDrawPath = new BMap.Polyline(eachPach,strokeStyle);
                    map.addOverlay(eachDrawPath);
                    addPath.push(eachDrawPath);
                });

            }else{
                drawPath = new BMap.Polyline(paths[pathId],strokeStyle);
                map.addOverlay(drawPath);
                addPath = drawPath;
            }

            if(!notAdjustView){//自动调节视角
                if(_.isArray(paths[pathId]) && paths[pathId].length>0 && _.isArray(paths[pathId][0])){
                    boundId = pathId;
                    map.setViewport(bounds[boundId]);//区域
                }else{
                    map.setViewport(paths[pathId]);
                }

            }
            return addPath;
        }else if(operation == "delete" || operation == "remove"){
            if(_.isArray(deletePath) && deletePath.length>0 && _.isArray(deletePath[0].points)){//删除多条线路
                deletePath.forEach(function(eachLine){
                    map.removeOverlay(eachLine);
                });
            }else{
                map.removeOverlay(deletePath);
            }

        }

    }
    function adjustViewport(pathId,isBound){
        var mapInfoObj = getCurrMapInfo(),
            map = mapInfoObj.map,
            boundId,
            bounds = mapInfoObj.bounds,
            paths = mapInfoObj.paths;
        if(isBound){
            boundId = pathId;
            map.setViewport(bounds[boundId]);//区域
        }else{
            map.setViewport(paths[pathId]);
        }

    };
    //从全局的变量中去拿一些map的信息
    //{}
    function getCurrMapInfo(){
        return window.mapInfoObj;
    }

    function initAutoCompleteInputs(){
      var cityName = getSearchCondition("cityName");
        startInputAutoComplete = makeBaiduAutoComplete(fish.dom(".startPlace input"),cityName,startInputAutoComplete);
        endInputAutoComplete = makeBaiduAutoComplete(fish.dom(".endPlace input"),cityName,endInputAutoComplete);
        startInputAutoComplete.setInputValue(getSearchCondition("startPlace"));
        endInputAutoComplete.setInputValue(getSearchCondition("endPlace"));
        startInputAutoComplete.addEventListener("onconfirm",function(){
            window.publish("seacrchMapConditionChange");
        });
        endInputAutoComplete.addEventListener("onconfirm",function(){
            window.publish("seacrchMapConditionChange");
        });


    };
    //新建placeholder
    function makeBaiduAutoComplete(inputElem,cityName,deleteAutoComplete){
        var autoComplete;
        if(deleteAutoComplete && deleteAutoComplete.dispose){
            deleteAutoComplete.dispose();//销毁
        }
        autoComplete = new BMap.Autocomplete({
            location:cityName,
            input:inputElem
        });
        return autoComplete;

    }

    //placeHolder
    function initPlaceHolder(uElem){
        var placeHolderText = uElem.attr("data-placeHolder");
        uElem.on("focus",function(){
            var inputVal = fish.trim(uElem.val());
            if(inputVal == placeHolderText){
                uElem.val("");
            }
            uElem.css("color:#333;");
        });
        uElem.on("blur",function(){
            var inputVal = fish.trim(uElem.val());
            if(inputVal == placeHolderText || inputVal==""){
                uElem.val(placeHolderText);
                uElem.css("color:#999;");
            }
        });

        var inputVal = fish.trim(uElem.val());
        if(inputVal == placeHolderText || inputVal==""){
            uElem.val(placeHolderText);
            uElem.css("color:#999;");
        }


    }


})();
