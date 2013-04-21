/**
 * fish let`s 17u.
 * @author 前端开发部
 * @version 2.0
 * @modify 2012-03-06
 */
var fish;       //fish全局使用对象

(function (doc, win) {
    //内部使用的框架变量，为了得到更好的压缩率
    var F,    //按需加载捕获对象声明
    uList = {
        //动画
        anim : {v:"0.1", g:"201206110"},
        //tab
        mTab : {v: "0.1", g:"20120608"},
        //日历
        mCal : {v:"0.4", css:1, g:"20120713"},
        preventInput : {parent:"mCal"},
        recoverInput : {parent:"mCal"},
        //日历
        mSlider : {v:"0.1", css:1, g:"20120620"},
        //日历
        mPop : {v:"0.1", css:1, g:"20120608"},
        lazyLoad : {v:"0.1", g:"20120620"}
    };
//<<<<<<<<<<------------------- sprite-pipe start ----------------------------
    //参数
    var param = {
        //调试用的分支
        debug : "fwd.",
        //正式使用的分支
        product : "",
        //当前分支
        branch:"debug",
        //基础url，在框架初始化时，即算出
        baseUrl : (function() {
            //获取baseurl
            var scripts = document.getElementsByTagName("script"),
                sl = scripts.length,
                tmpSrc = baseUrl = '';
            while(sl--) {
                tmpSrc = scripts[sl].src;
                if(tmpSrc.indexOf('fish.') > -1) {
                    break;
                }
            }
            baseUrl = tmpSrc.match(/.*(?=fish\.)/g);
            //模块代码都在module子目录中
            return baseUrl ? baseUrl[0] + "module/" : "";
        })(),
        //格式化的脚本文件地址
        fmJs : "{model}/{version}/{model}.{branch}js?v={generation}",
        //格式化的样式表文件地址
        fmCss : "{model}/{version}/{model}.css?v={generation}",
        //是否使用CDN文件合并支持
        combine : false,
        //精灵收集时间间隔
        spriteInterval : 0,
        //使用CDN文件合并支持的url
        // exp : http://js.40017.cn/cn/cdn/?/cn/public/fish.fwd.1.1.js&/cn/module/mpop/0.1/mpop.js&/cn/module/mtab/0.1/mtab.js?v=2012011101
        fmCombineFn : function(files){
            var host = "http://js.40017.cn";
            for(var n=0, max=files.length; n < max; n++){
                files[n] = files[n].replace(host, "");//.replace(/\?[\S]*$/g, "");
            }
            return "http://js.40017.cn/cn/cdn/?" + files.join("&");
        }
        
    };

    

    //
    // 扩展数组的原型
    
    if (![].forEach) {
        /*
            示例：
            var arr = [1, false, 'tike'],
                op = {};
            arr.forEach(
                function(item, i, it) {
                    this['item_' + i] = item;
                    console.log(it.length);
                    if(!this.source) {
                        this.source = it;
                    }
                },
                op
            );
                
            示例代码将 arr 中的每项，按序在 op 的属性中罗列了出来，
            属性名分别是 item_n，n 为数组中的下标，
            还把 arr 的引用，赋予了 op 的 source 属性
                
            op 可以不传，那么 this 就是 window，示例依然 ok
            假设 op 没有传，this 换成了 op，示例还是 ok（但这种做法糟糕透了）
                
        */
            
        // 在 forEach 函数内，this 均指数组本身
        // 因为 Array 的 prototype 中有 forEach 方法，
        // 所以 Array 的实例从它的 prototype 中继承 forEach 方法，
        // forEach 中的 this 自然是 Array 的实例
        // fn 中可以传 3 个参数，分别是
        // 当前数组所在下标的值，当前下标，数组本身
        // fn 中的 this，不再是数组本身，默认的是 window，也可以传入对象
        // 如示例代码中的 op
        // 之所以 fn 中的 this，除了 window 就是传入的对象，是因为 call 的缘故
        // 同样的 apply 也可以做到
        Array.prototype.forEach = function(fn) {
            var len = this.length || 0,
                i = 0,
                that = arguments[1]; // 用来重置函数 fn 中 this 的东西
            if (typeof fn == 'function') {
                for (; i < len; i++) {
                    fn.call(that, this[i], i, this);
                    // fn.apply(that, [this[i], i, this]) 与上述语句等价；
                    // 换言之，call 和 apply 除了语法形式上不同，实质是相同的
                }
            }
        };
    }

    //扩展indexOf
    if (!Array.prototype.indexOf){
        Array.prototype.indexOf = function(value){
            var index,
                length;
            for (index = 0,length = this.length;index <length; index++){
                if(this[index] === value) {
                    return index;
                }
            }
            return -1;
        }
    }

    /** 使用原型链接来创建新对象
    * @param {Object} obj 要赋予原型的对象
    */
    function proto (obj) {
        var fn = function(){};
        fn.prototype = obj;
        return new fn();
    }
    /** 扩展对象，目前只有单层
     *
     */
    function extend (tar, merge, force) {
        if (merge && tar) {
            var src, copy, name;
            for (name in merge) {
                if ((copy = merge[name]) != null || force) {
                    tar[name] = copy;
                }
            }
            return tar;
        }
    };

    //为了保证独立性，spritepipe和索引器都有这个方法
    var rwhite = /\s/,
        trimLeft = /^\s+/,trimRight = /\s+$/;
    if(!rwhite.test('\xA0')) {
        trimLeft = /^[\s\xA0]+/;
        trimRight = /[\s\xA0]+$/;
    }
    var trim = String.prototype.trim ?
        function(text) {
            return (text === undefined || text === '') ? '' : String.prototype.trim.apply(text);
        } :
        function(text) {
            return (text === undefined || text === '') ? '' :
            text.toString().replace(trimLeft, '').replace(trimRight, '');
        };
    

    //精灵管道
    var spritepipe;
    (function(){
        var
        //保存执行队列
        execs = [],//exp:{_mCal_:[[fn, that, arg], [fn, that, arg], [fn, that, arg]], _mCal_mPop_:[]}
        //监听器
        listener = {},//exp:{mCal:{loading:[fn, fn], loaded:[fn]}, anim:{}}
        //精灵收集数组
        sprite = {
            js : {name : [], url : [], timer:null },
            css : {name : [], url : [], timer:null }
        },
        //保存head
        firstScript = doc.getElementsByTagName("script")[0],
        branchReg = /{branch}/g,
        modelReg = /{model}/g,
        genReg = /{generation}/g,
        versionReg = /{version}/g;




        //移除数组中匹配的元素
        function removein(array, obj){
            var n = array.length;
            while(n--){
                if(array[n] === obj){
                    array.splice(n, 1);
                    return;
                }
            }
        }


        //字符串转换成干净的数组 "  mCal    mPop " ---> ["mCal", "mPop"]
        function toArray(str){
            return trim(str.replace(/\s+/g, " ")).split(" ");
        }


        spritepipe = {
            //配置参数
            //param : {},
            //核心列表
            //uList : {},
            //每个函数的状态值
            STATE : {
                UNLOAD : 0,
                LOADING : 1,
                LOADED : 2
            },
            uList : uList,
            execs : execs,
            listener : listener,
            load : function(names, fn, that, arg){
                var nameArray = toArray(names).sort(), allreadyN = 0, subname,
                    thisU, fnl = nameArray.length, loadedN = 0;

                if(fn){
                    var linkName = "_" + nameArray.join("_") + "_";
                    if(!execs[linkName]) {
                        //填充混合数组
                        execs[(execs[execs.length] = linkName)] = [];
                    }                
                
                    for(var n=0, nmax=nameArray.length; n < nmax; n++){
                        subname = nameArray[n];
                        //检测当前是否已经加载好某些组件
                        if(F[subname] && !F[subname]._sprite_) {
                            allreadyN++;
                            execs[linkName][subname] = true;
                        }
                    }
                    //保存回调队列
                    execs[linkName].push([fn, that, arg]);
                    //总的依赖数目
                    execs[linkName].num = nameArray.length;
                    //当前已加载的数目
                    execs[linkName].now = allreadyN;
                    //可以直接执行回调
                    if(nameArray.length === allreadyN){
                        _pipe.exec(linkName);
                        return;
                    }
                }

                nameArray.forEach(function(name){
                    thisU = uList[name];
                    //如果还没有开始加载，或者已经加载完成却没有挂载执行体
                    if(spritepipe.state(name) < spritepipe.STATE.LOADING || (spritepipe.state(name) === spritepipe.STATE.LOADED && fish[name]._sprite_) ){
                        //是否被包含在其他模块的脚本中
                        if(thisU.parent){
                            spritepipe.load(thisU.parent);
                        }
                        else{
                            //加载模块脚本, 最后一个参数可以传回调
                            _pipe.newElem("js", name, _pipe.parseUrl("fmJs", name, thisU));
                            //加载模块样式表, 最后一个参数可以传回调
                            //TODO:样式表载入完成后在执行脚本
                            thisU.css && _pipe.newElem("css", name, _pipe.parseUrl("fmCss", name, thisU));
                            //加载中
                            spritepipe.state(name, spritepipe.STATE.LOADING);
                            _pipe.eventExec(name, "loading");
                        }
                    }
                    else if(spritepipe.state(name) === spritepipe.STATE.LOADED){
                        _pipe.exec(name);
                    }
                });
            },
            //扩展的回调
            extend : function(names){
                //加载完成后标记状态
                spritepipe.state(names, spritepipe.STATE.LOADED);
                _pipe.eventExec(names, "loaded");
                //执行回调
                _pipe.exec(names);            
            },
            //添加管道的事件监听
            on : function(name, type, fn){
                var lName = listener[name];
                lName = lName || {};
                lName[type] = lName[type] || [];
                lName[type].push(fn);
                listener[name] = lName;
            },
            //移除管道的事件监听
            remove : function(name, type, fn){
                if(listener[name] && listener[name][type]){
                    removein(listener[name][type], fn);
                }
            },
            //获取状态值,或设置状态值
            state : function(names, value){
                var name, nameArray = toArray(names);
                for(var i=0, imax=nameArray.length; i<imax; i++){
                    name = nameArray[i];
                    if(uList[name]){
                        if(value){
                            //设置状态值
                            if(uList[name].parent){ this.state(uList[name].parent, value); }
                            else{ uList[name].state = value; }
                        }
                        else{
                            var rt = uList[name].parent ? this.state(uList[name].parent) : uList[name].state;
                            return rt ? rt : this.STATE.UNLOAD;
                        }                    
                    }

                }
            }
        };

        //私有执行方法
        _pipe = {
            //执行回调函数
            //去掉多name的支持
            exec : function(names){
                var fnn, fns, fn, name, nameArray = toArray(names).sort(), n;
                for(var i=0, imax=nameArray.length; i<imax; i++){
                    name = nameArray[i];
                    n = execs.length;
                    //倒序，为了移除元素
                    while(n--){
                        fnn = execs[n];
                        //使用数值来判断是否全部加载完成
                        if(fnn.indexOf("_"+name+"_") > -1 && !execs[fnn][name]){
                            execs[fnn][name] = true;
                            execs[fnn].now++;
                        }
                        if(execs[fnn].now >= execs[fnn].num){
                            fns = execs[fnn];
                            while((fn = fns.shift())){
                                //为了更加稳定的执行，一个报错不至于中断整个循环执行
                                setTimeout((function(fn, F, win){
                                    return function(){
                                        if(typeof fn[0] === "function"){
                                            //回调函数
                                            if(fn[2]){
                                                fn[0].apply(fn[1] ? fn[1] : win, fn[2]);
                                            }
                                            else{
                                                fn[0].apply(fn[1] ? fn[1] : win);
                                            }
                                        }
                                        else if(F[fn[0]]){
                                            //精灵执行
                                            !F[fn[0]]._sprite_ && F[fn[0]].apply(fn[1], fn[2]);
                                        }
                                    }
                                })(fn, F, win), 0);
                            }
                            //删除堆栈
                            execs.splice(n, 1);
                            execs[fnn] = null;
                        }
                    }
                }
            },
            //转化url
            parseUrl : function(type, name, obj){
                //替换版本
                var url = param[type].replace(modelReg, name).replace(versionReg, obj.v).replace(genReg, obj.g);
                //替换分支
                return param.baseUrl + url.replace(branchReg, param[param.branch]);
            },
            //执行事件绑定函数
            eventExec : function(names, type){
                var fns, fn, nameArray = toArray(names), n;
                for(var i=0, imax=nameArray.length; i<imax; i++){
                    name = nameArray[i];
                    if(listener[name] && listener[name][type]){
                        fns = listener[name][type];
                        //执行并且移除事件函数
                        //while((fn = fns.shift())) fn();
                        //执行但是不移除事件函数
                        n = fns.length;
                        while((fn = fns[--n])) fn();
                    }
                }
            },
            //新建脚本或样式表节点
            newElem : function(type, name, url, fn){

                //firstBodyChild = doc.body ? doc.body.firstChild : null;
                //if(sprite[type].url.length === 0){
                    //判断是否使用CDN合并
                function send(){
                    var newElem,
                        names = sprite[type].name.join(" "),
                        elemUrl = param.combine ? (sprite[type].url.length > 1 ? param.fmCombineFn(sprite[type].url) : sprite[type].url[0]) : url;
                    if(elemUrl){
                        switch(type){
                            case "css":
                                newElem = doc.createElement("link");
                                newElem.rel = "stylesheet";
                                newElem.type = "text/css";
                            break;
                            case "js":
                                newElem = doc.createElement("script");
                                newElem.async = true;
                                newElem.type = "text/javascript";
                            break;
                        }
                        newElem.onreadystatechange = newElem.onload = function(){
                            var state = newElem.readyState;
                            if (!state || /loaded|complete/.test(state)) {
                                newElem.onreadystatechange = null;
                                typeof fn === "function" && fn(names);
                            }
                        };
                        switch(type){
                            case "css":
                                newElem.href = elemUrl;
                            break;
                            case "js":
                                newElem.src = elemUrl;
                            break;
                        }
                        //能使用body就用body，来自lazyload的经验
                        firstScript.parentNode.insertBefore(newElem, firstScript);

                        sprite[type].name = [];
                        sprite[type].url = [];
                        sprite[type].timer = null;
                    }
                }



                if(param.combine){
                    if(sprite[type].timer) {
                        clearTimeout(sprite[type].timer);
                    }
                    sprite[type].timer = setTimeout(send, param.spriteInterval);
                    sprite[type].name.push(name);
                    sprite[type].url.push(url);
                }
                else{
                    send();
                }
            }
        };

    })();



    var
    //骨架，存放核心对象
    bones = [], //exp. [ {name : "exec", fn : {} } ]
    //拥有的高权限对象，最后会成为全局对象superfish
    su = {
        //实例化核心
        cores : {},
        /**
        * 创建级联核心
        */
        link : function () {
            var tempBone = su.cores.sprite = su.sprite.fn;
            for(var n=0; n<bones.length; n++){
                tempBone = proto(tempBone);
                extend(tempBone, bones[n].fn);
                su.cores[bones[n].name] = tempBone;
            }
            //导出到全局变量
            return tempBone;
        },
        //针对收集骨架的append
        append : function(name, fn){
            if(!su.cores[name]){
                //做标记，避免使用循环数组的方法来判断是否已经创建
                su.cores[name] = true;
                bones.push({name:name, fn:fn});
            }
        },
        roe : function(){
            return proto(su.cores["exec"]);
        },
        //sprite对象
        sprite : {
            //初始化sprite捕获核心
            init : function(){
                for(name in uList){
                    //捕获函数
                    if(!this.fn[name] || (this.fn[name] && !this.fn[name]._sprite_) ){
                        this.fn[name] = function(fn){
                            var rtf = function(){
                                spritepipe.load(fn, fn, this, arguments);
                            }
                            rtf._sprite_ = true;
                            return rtf;
                        }(name);                    
                    }

                }
            },
            fn : {}
        },
        //是否合并脚本
        combine : function(it){
            param.combine = it;
        },
        //设置当前分支
        branch : function (it){
            if(param[it] != null){
                param.branch = it;
            }
        },
        //精灵列表
        config : function(obj){
            extend(uList, obj);
            this.sprite.init();
        },
        //对精灵管道的引用
        pipe:spritepipe,
        //配置参数的引用
        //param: param,
        //特殊的扩展需求时使用
        extend:function(corename, obj, notSprite){
            var core = su.cores[corename];
            core && extend(core, obj);
            var name;
            //是否不属于精灵管道组件
            if(!notSprite){
                for(name in obj){
                    spritepipe.extend(name);
                }            
            }
        }
    };

    
    //<<<<<<<<<<<<-------------------------Link fish--------------------------------------
    //初始化sprite捕获核心
    su.sprite.init();
    //添加基本核心，挂载基础函数，精灵管道等(暂时屏蔽)
    //su.append("base", {});
    //添加执行顶层核心
    su.append("exec", {});
    //创建原型链，这句代码之后fish就可以实现动态后绑定了
    F = fish = su.link();
    //-------------------------------------Link fish end----------------------->>>>>>>>>>>>


    //扩展一些基本的方法
    su.extend("exec", {
        //获取一个唯一字符串
        guid : function(){
            var S4 = function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        },
        //提供一些编码方面的支持的函数
        lang:{
            //扩展对象
            extend : extend,
            //继承原型
            proto : proto
        },
        //扩展执行核的方法
        extend : function(obj, notSprite){
            su.extend("exec", obj, notSprite);
        },
        /**
        * 取字符串前后空格
        * @param {String} str 需要截取的字符串
        */
        trim : trim,
        //直接声明需要的组件
        require : function(){
            var arg = arguments, dFn, lTime, fn, dFnCall;
            for(var n=1; n<arg.length; n++){
                switch(typeof arg[n]){
                    case "string":
                        //定义执行时间点
                        switch(arg[n]){
                            case "loaded":
                                dFn = "loaded";
                            break;
                            case "ready":
                                dFn = "ready";
                            break;
                        }
                    break;
                    case "number":
                        //定义延时时间
                        lTime = arg[n];
                    break;
                    case "function":
                        //定义回调函数
                        fn = arg[n];
                    break;
                }
            }
            //加载
            dFnCall = function(){spritepipe.load(arg[0], fn)};
            if(lTime){
                setTimeout(function(){
                    if(dFn){
                        fish[dFn](dFnCall);
                    }
                    else{
                        dFnCall();
                    }
                }, lTime);
            }
            else if(dFn){
                fish[dFn](dFnCall);
            }
            else{
                dFnCall();
            }
        }
    });

    //导出到全局变量
    F.admin = su;
    
    F.inWater=true;

//-------------------------------- sprite-pipe end ---------------------------->>>>>>>>>>>>


//<<<<<<<---------------------------ready & loaded ---------------------------------
(function(){
    var dr = old = false,
        drfns = [],
        olfns = [];
    /*
     * 函数 rd 的作用在于确定 DOMContentLoaded || DOmKontentloadid 的时机
     * (ie 6, 7 或许还有 8 的 DOMContentLoaded 的异类叫法，以示他们的这个时机是 hack 来的)
     * 一旦 DOMContentLoaded || DOmKontentloadid 监听器触发
     * ready 的标志 dr 置 true，接着 queue('ready')
     * ready 过后，loaded 监听器触发 window.addEventListener || window.attachEvent
     * loaded 的监听器首先执行 rd，那是因为万一 dr 在 loaded 时仍为 false，
     * 那么所有 drfns 队列中的待执行的函数由 loaded 释放，之后 onload 标志 old 置 true
     * 释放 loaded 队列 olfns 中的函数
     */
    function rd() {
        if(!dr){
            dr = true;
            queue("ready");
        }
    }
    function load(){
        rd();
        old = true;
        queue("loaded");
    }

    if(doc.addEventListener) {
        /*
         * 如果存在 document.addEventListener
         * 将函数分别绑到 DOMContentLoaded 和 onload
         */
        doc.addEventListener('DOMContentLoaded', rd, false);
        win.addEventListener('load', load, false);
    }else if(doc.attachEvent) {
        /*
         * 如果存在 document.attachEvent
         * 将函数分别绑到 onload 和 hack 的 DOmKontentloadid
         */
        // hack 的 DOmKontentloadid 函数
        (function() {
            var docm = doc.documentElement;
            if(docm.doScroll) {
                try {
                    docm.doScroll('left');
                    //来修复在ifame中ready时间点判断出现的bug
                    if(!doc.body){
                        throw "body has not ready";
                    }
                    rd();
                } catch(e) {
                    setTimeout(arguments.callee, 10);
                }
            }
        })();
        win.attachEvent('onload', load);
    }

    /*
     * @param {String} lt 载入类型（loaded type）
     * ready = DOMContentLoaded || DOmKontentloadid
     * loaded = onload
     * 如果 DOMContentLoaded || DOmKontentloadid || onload 任意时刻达到或者已过，
     * 按载入类型执行相关队列中的 fn
     */
    function queue(lt) {
        if(lt === 'ready') {
            while(drfns.length) {
                drfns.shift()();
            }
        }else if(lt === 'loaded') {
            while(olfns.length) {
                olfns.shift()();
            }
        }
    }

    //扩展到fish
    fish.extend({
        /*
         * 投放 ready
         * @param {Function} fn 单个函数
         * 如果 dr === true，表明 ready 执行时机正好是 DOMContentLoaded || DOmKontentloadid
         * 或者已过，那么立即执行 fn，然后返回
         * 如果 dr !== true，表明 ready 执行时机尚未 DOMContentLoaded || DOmKontentloadid
         * 将 fn 载入 ready 执行队列 drfns
         * 待到 DOMContentLoaded || DOmKontentloadid，按先入先出顺序执行 drfns 中的各个 fn
         */
        ready : function(fn) {
            if(typeof fn === 'function') {
                dr ? fn() : drfns.push(fn);
            }
        },
        /*
         * 投放 loaded
         * @param {Function} fn 单个函数
         * 如果 old === true，表明 loaded 执行时机正好 onload
         * 或者已过，那么立即执行 fn，然后返回
         * 如果 old !== true，表明 loaded 执行时机尚未 onload
         * 将 fn 载入 loaded 执行队列 olfns
         * 待到 onload，按先入先出，顺序执行 olfns 中的 fn
         */
        loaded : function(fn) {
            if(typeof fn === 'function') {
                old ? fn() : olfns.push(fn);
            }
        }
    }, true);

})();
//---------------------------ready & loaded --------------------------------->>>>>>>>>>

//<<<<<<<<<<<<-------------------------Mount--------------------------------------
(function (){

    //<<<<<<<<------------------------selector-------------------------------------
    
    /**
    * @param {String | Node | Nodelist | NodeArray | Document | Window | undefined} [selectors] 同 sparrow
    * @param {Node | Document | undefined} [context] 同 sparrow
    * @param {String} mark 标记位，支持 doc.querySelectorAll 传递'querySelectorAll'，对于不支持的浏览器则传递 undefined
    * @returns {Object | NodeArray | Undefined} 返回一个对象含有属性 selectors 字符串和 context 对象；或元素数组，或undefined
    */
    function processParameter(selectors, context, mark, oneFlag) {
        var parameter = processParam(selectors, context, oneFlag),
            one,
            result = [];
        if(parameter) {
            if (parameter.selectors && parameter.context) {
                if(mark === 'querySelectorAll') {
                    if(oneFlag) {
                        one = parameter.context.querySelector(parameter.selectors);
                        one && result.push(one);
                    }else {
                        result = parameter.context.querySelectorAll(parameter.selectors);
                    }
                    return result;
                }
                return parameter;
            }else if(parameter.result) {
                return parameter.result;
            }
        }else {
            return;
        }

        /**
        * @param {String | Node | Nodelist | NodeArray | Document | Window | undefined} [selectors] 同 sparrow
        * @param {Node | Nodelist | NodeArray | Document | undefined} [context] 同 sparrow
        * @returns {Object | NodeArray | Undefined} 返回一个对象含有属性 selectors 和 context；或元素数组，或undefined
        */
        function processParam(selectors, context, oneFlag) {
            var iContext,
                iSelectors,
                tmp,
                result = [];
            if(context === undefined) {
                iContext = doc;
            }else if(
                    context.nodeType === 1 ||
                    context.nodeType === 9
                    ) {
                iContext = context;
            }else if(
                    context.length === 1 &&
                    context[0].nodeType === 1
                    ) {
                iContext = context[0];
            }else {
                return;
            }

            if(typeof selectors === 'string' && selectors !== '') {
                iSelectors = selectors;
            }else if(
                    selectors &&
                    (selectors.nodeType === 1 || selectors.nodeType === 9 || selectors === win) &&
                    arguments[1] === undefined
                    ) {
                result.push(selectors);
                return {
                    result: result
                };
            }else if(
                    typeof selectors === 'object' &&
                    typeof selectors !== 'function' &&
                    selectors.length &&
                    arguments[1] === undefined
                    ) {
                if(oneFlag) {
                    result.push(selectors[0]);
                }else {
                    result = selectors;
                }
                return {
                    result: result
                }
            }else {
                return;
            }

            if(iContext && iSelectors) {
                return {
                    selectors: iSelectors,
                    context: iContext
                }
            }
        }

    }

    /**
    * @param {String} selectors 选择器字符串
    * @param {Regex} chunker 分组选择器字符串的正则表达式
    * @returns {ArrayArray} 返回一个二维数组，每项是个选择器字符串数组
    */
    function makeSelectorsQueue(selectors, chunker) {
        var tmp,
            selectorsQueue = [],
            remain,
            currentSelectors = selectors,
            processSelectors = [];
                
        do{
            // 重置正则表达式的匹配位（iChunker.index = 0）
            chunker.exec('');
            tmp = chunker.exec(currentSelectors);
            if(tmp) {
                currentSelectors = tmp[3];
                processSelectors.push(tmp[1]);
                if(tmp[2]) {
                    remain = tmp[3];
                    break;
                }
            }
        }while(tmp);
            
        if(remain) {
            if(
                remain.indexOf(',') === 0 || 
                remain.indexOf(',') === remain.length - 1
                ) {
                express.error();
            }
            // 之所以将原来就是数组的 processSelectors 再包在一个数组内，
            // 是为了能作为一个整体的项被 concat 到 selectorsQueue 中，
            // selectorsQueue 是个 2 维数组，每个项都是一个选择器字符串数组
            return selectorsQueue.concat([processSelectors], makeSelectorsQueue(remain, chunker));
        }else {
            return [processSelectors];
        }
        // return selectorsQueue;
    }
    
    function filterSelector(split, node) {
        var id = split["#"],
            type = split["tag"],
            pseudo = split[":"],
            className = split["."],
            attribute = split["[]"];
            // console.log(attribute);
        if(id && !filterSelector.checkWithId(id, node)) {
            return false;
        }
        
        if(type && !filterSelector.checkWithType(type, node)) {
            return false;
        }
        
        if(pseudo && !filterSelector.checkWithPseudo(pseudo, node)) {
            return false;
        }
        
        if(className && !filterSelector.checkWithClassName(className, node)) {
            return false;
        }
        
        /* if(attribute && !filterSelector.checkWithAttribute(attribute, node)) {
            return false;
        } */
        
        return true;
        
    }
    filterSelector.checkWithId = function(id, node) {
        var id = id[0].substring(1);
        if(node.id === id) {
            return true;
        }
        return false;
    }
    filterSelector.checkWithType = function(type, node) {
        var type = type[0];
        if(node.nodeName.toLowerCase() === type || "*" === type) {
            return true;
        }
        return false;
    }
    filterSelector.checkWithPseudo = function(pseudo, node) {
        var i = 0,
            item,
            element,
            count = 0;
        for(; item = pseudo[i]; i++) {
            element = node;
            switch(item) {
                case ":first-child":
                    do {
                        if(element.previousSibling && element.previousSibling.nodeType === 1) {
                            count--;
                            break;
                        }
                        element = element.previousSibling;
                    }while(element !== null)
                    if(!element) {
                        count++;
                    }
                break;
                case ":last-child":
                    do {
                        if(element.nextSibling && element.nextSibling.nodeType === 1) {
                            count--;
                            break;
                        }
                        element = element.nextSibling;
                    }while(element !== null)
                    if(!element) {
                        count++;
                    }
                break;
            }
        }
        // console.log(count);
        if(count > 0) {
            return true;
        }
        return false;
    }
    filterSelector.checkWithClassName = function(className, node) {
        var i = 0,
            item,
            element,
            every,
            cn = node.className;
            // cnLen = F.trim(cn).length;
        if(cn.length === 0) {
            return false;
        }
        cn = " " + cn + " ";
        for(; item = className[i]; i++) {
            if(cn.indexOf(item) < 0) {
                return false;
            }
        }
        return true;
    }
    filterSelector.checkWithAttribute = function(attribute, node) {
        // console.log(attribute);
    }
    
    // 获得相关元素，后代元素（直系，子孙），相邻元素（下一个，下一批）
    function getRelate(selectors, context, sets, mark) {
        var i = 0,
            ii = 0,
            waits,
            result = [],
            split = express.splitSelectors(selectors),
            id = split["#"],
            type = split["tag"],
            filter = null,
            item = null,
            one = null;
            
        if(id) {
            // id = unique(id, 'diff');
            if(id.length > 1) {
                return result;
            }
        }
        
        
        for(; item = sets[i]; i++) {
            switch(mark) {
                case ">":
                    waits = getChildren(item);
                    filter = split;
                break;
                case "":
                    if(id) {
                        waits = getById(id[0], item);
                        filter = getFilterSelector(split, "#");
                    }else if(type) {
                        waits = getByType(type[0], item);
                        filter = getFilterSelector(split);
                    }else {
                        waits = getByType("*", item);
                        filter = getFilterSelector(split);
                    }
                break;
                case "+":
                    waits = getNextNodes(item, "+");
                    filter = split;
                break;
                case "~":
                    waits = getNextNodes(item);
                    filter = split;
                break;
            }
            
            // filter = makeClassNameCheckFast(filter);
            
            ii = 0;
            for(; one = waits[ii]; ii++) {
                if(filterSelector(filter, one)) {
                    result.push(one);
                }
            }
            
            
        }
        result = unique(result, 'union');
        
        return result;
        
        function getChildren(parent) {
            var result = [],
                node = parent.firstChild;
            
            while(node) {
                if(node.nodeType === 1) {
                    result.push(node);
                }
                node = node.nextSibling;
            }
            
            return result;
        }
        
        function getNextNodes(node, mark) {
            var result = [];
            do {
                node = node.nextSibling;
                if(node && node.nodeType === 1) {
                    result.push(node);
                    if(mark === "+") {
                        break;
                    }
                }
            }while(node !== null);
            return result;
        }
        
        
    }
    
    function getFilterSelector(split, ignoreSelector) {
        var filterSet = {
                ":": split[":"],
                ".": split["."],
                "[]": split["[]"]
            },
            cnSet = filterSet["."],
            newCnSet = [],
            i = 0,
            item;
        if(cnSet.length) {
            for(; item = cnSet[i]; i++) {

                newCnSet.push(" " + item.substring(1) + " ");
            }
            filterSet["."] = newCnSet;
        }
        switch(ignoreSelector) {
            case "#":
                filterSet["tag"] = split["tag"];
            break;
            default:
                return filterSet;
            break;
        }
        return filterSet;
    }
    
    
    // 获取相邻元素 过期
    /**
     * @param {String} selectors
     * @param {Node} context
     * @param {NodeArray | NodeList} currents
     * @param {String} mark '~' | '+'
     * @param {Boolean} oneFlag 是否需要返回一个元素，是 true
     * @returns {NodeArray | Array}
     */

    // 获取后代元素 过期
    /**
     * @param {String} selectors
     * @param {Node} context
     * @param {NodeArray | NodeList} parents
     * @param {String} mark '>' | ''
     * @param {Boolean} oneFlag 是否需要返回一个元素，是 true
     * @returns {NodeArray | Array}
     */

    // 运行挖掘机
    /**
     * @param {StringArray} selectorsArray 选择器字符串数组
     * @param {Node | Document} context 选择器的范围对象（在 context 内获取元素）
     * @param {Boolean} oneFlag 是否只返回结果集的第一个元素，true 是
     * @returns {NodeArray | Array} 元素数组或空数组（如果没有抓取到元素）
     */
    function runDigger(selectorsArray, context) {
        var selector,
            selectorSplits,
            relation,
            l = selectorsArray.length,
            i = 0,
            result = [];
        
        while(i !== l) {
            selector = selectorsArray[i];
            selectorSplits = express.splitSelectors(selector);
            if(i === 0) {
                result = getNodes(selectorSplits, context);
            }else {
                
                relation = typeof selectorSplits['rel'] === 'string' ? selectorSplits['rel'] : selectorSplits['rel'][0];
                if(relation !== '') {
                    selector = selectorsArray[++i];
                }
                result = getRelate(selector, context, result, relation);
                    
                if(result.length === 0) {
                    return result;
                }
            }
            i++;
        }
            
        return result;
    }
        
    function getNodes(selectorSplits, context) {
        var id = selectorSplits['#'],
            type = selectorSplits['tag'],
            pseudo = selectorSplits[':'],
            className = selectorSplits['.'],
            attribute = selectorSplits['[]'],
            filter = null,
            result = [];
            
        // process id
        if(id) {
            if(id.length > 1) {
                return result;
            }else {
                filter = getFilterSelector(selectorSplits, "#");
                return getAndFilter(id, context, filter, '#');
            }
        }
        
        if(type) {
            filter = getFilterSelector(selectorSplits);            
            return getAndFilter(type, context, filter, 'tag');
        }
        
        if(pseudo) {
            filter = getFilterSelector(selectorSplits);
            return getAndFilter(pseudo, context, filter, ':');
        }
        
        
        if(className) {
            filter = getFilterSelector(selectorSplits);
            return getAndFilter(className, context, filter, '.');
        }
            
        // process attribute
        /* if(attribute) {
            result = getByProcessSelectors(unique(attribute, 'union'), context, '[]', result);
            return getAndFilter(attribute, context, filter, '[]');
        } */
        
    }
        
    /**
     * @param {StringArray} selectors 选择器字符串数组
     * @param {Node} context 范围对象
     * @param {String} mark 代表选择器的符号，如‘#’、‘.’、‘tag’、‘[]’、‘:’；
     * @param {NodeArray | NodeList | Array} re 元素数组或元素集合或空数组
     * @returns {NodeArray | Array} 返回元素数组或空数组
    */
    function getAndFilter(selector, context, filter, mark) {
        var i = 0,
            item,
            collector = [],
            result = [];
        switch(mark) {
            case '#':
                collector = getById(selector[0], context);
            break;
            case 'tag':
                collector = getByType(selector[0], context);
            break;
            case ':':
                collector = getByPseudo(selector[0], context);
            break;
            case '.':
                if(selector.length > 1) {
                    collector = getByType("*", context);
                }else {
                    collector = getByClassName(selector[0], context);
                }
            break;
            /*
            case '[]':
                collector = getByAttribute(selector[0], context);
            break;
            */
        }
        
        // filter = getFilterSelector(filter);
        
        for(; item = collector[i]; i++) {
            if(filterSelector(filter, item)) {
                result.push(item);
            }
        }
        
        return result;
    }
        
    // 获取 id 元素
    /**
     * @param {String} selector
     * @param {Node | Document} context
     * @returns {NodeArray}
     */
    function getById(selector, context) {
        var element = null,
            result = [];
        element = document.getElementById(selector.substring(1));
        if(element) {
            result.push(element);
        }
        return result;
    }
        
    // 抓取标签类型（即 tagName）
    /**
     * @param {String} selector
     * @param {Node | Document} context
     * @returns {NodeArray}
     */
    function getByType(selector, context) {
        var result = context.getElementsByTagName(selector);
        if(selector === "*") {
            return beArray(result); 
        }
        return result;
    }
        
    // 获取 pseudo 元素
    /**
     * @param {String} selector
     * @param {Node | Document} context
     * @returns {NodeArray}
     */
    function getByPseudo(selector, context) {
        var lang,
            tmp = getByType('*', context),
            i = 0,
            l = tmp.length,
            tmpFirst,
            tmpPrev,
            tmpLast,
            tmpNext,
            elements = [];
            
        switch(selector) {
            case ':first-child':
                while(i !== l) {
                    if(tmp[i].nodeName.toLowerCase() !== 'html') {
                        tmpFirst = tmp[i];
                        tmpPrev = tmpFirst.previousSibling;
                        while(tmpPrev !== null) {
                            if(tmpPrev.nodeType === 1) {
                                break;
                            }
                            tmpPrev = tmpPrev.previousSibling;
                        }
                        if(!tmpPrev) {
                            elements.push(tmpFirst);
                        }
                    }
                    i++;
                }
            break;
            case ':last-child':
                while(i !== l) {
                    if(tmp[i].nodeName.toLowerCase() !== 'html') {
                        tmpLast = tmp[i];
                        tmpNext = tmpLast.nextSibling;
                        while(tmpNext !== null) {
                            if(tmpNext.nodeType === 1) {
                                break;
                            }
                            tmpNext = tmpNext.nextSibling;
                        }
                        if(!tmpNext) {
                            elements.push(tmpLast);
                        }
                    }
                    i++;
                }
            break;
        }
        return elements;
            
    }
        
    // 获取 class 元素
    /**
     * @param {String} selector
     * @param {Node | Document} context
     * @returns {NodeList | NodeArray}
     */
    function getByClassName(selector, context) {
        var tmp = context.getElementsByTagName('*'),
            className = " " + selector.substring(1) + " ",
            elements = [],
            refClassName,
            l = tmp.length;
        while(l--) {
            refClassName = " " + tmp[l].className + " ";
            if(refClassName.indexOf(className) > -1) {
                elements.unshift(tmp[l]);
            }
        }
        return elements;
    }
                
    // 获取 attribute 元素
    /** 暂时不用
     * @param {String} selector
     * @param {Node | Document} context
     * @returns {NodeArray}
     */
    /*
    function $getByAttribute(selector, context) {
        var attributeRule,
            property,
            value,
            tmp,
            iselector = F.trim(selector.substring(1, selector.length - 1)),
            flag; // the flag looks useful;
                
        if(!/=/.test(iselector)) {
            attributeRule = '';
            property = iselector;
                
        }else {
            if(iselector.indexOf('~=') > -1) {
                attributeRule = '~=';
                tmp = getPropertyValue(iselector, attributeRule);
                property = tmp.property;
                value = tmp.value;
                    
            }else if(iselector.indexOf('|=') > -1) {
                attributeRule = '|=';
                tmp = getPropertyValue(iselector, attributeRule);
                property = tmp.property;
                value = tmp.value;
            }else {
                attributeRule = '=';
                tmp = getPropertyValue(iselector, attributeRule);
                property = tmp.property;
                value = tmp.value;
            }
        }
            
        flag = getSpecialProperty(property);
        flag && (property = flag);
        
        return processAttribute(attributeRule, property, value);
            
        function getPropertyValue(selector, attributeRule) {
            var doubleQuotation = /"/g,
                singleQuotation = /'/g,
                property,
                value,
                start,
                end;
            start = selector.indexOf(attributeRule);
            property = F.trim(selector.substring(0, start));
            value = F.trim(selector.substring(start, end).replace(attributeRule, ''));
            if(doubleQuotation.test(value) || singleQuotation.test(value)) {
                value = value.substring(1, value.length - 1);
            }
            return {
                property: property,
                value: value
            }
        }
            
        // the follow looks useful
        function getSpecialProperty(property) {
            var specialProperty = express.match.specialAttributeMap[property];
            if(specialProperty) {
                return specialProperty;
            }
            return;
        }
            
        function processAttribute(attributeRule, property, value) {
            var tmp = getByType('*', context),
                l = tmp.length,
                elements = [],
                tmpElement,
                tmpValue,
                tmpValueL,
                valueString = [],
                valueEmptyString = [],
                valueNull = [],
                vesTmp,
                vesL,
                vesName,
                vesI = 0,
                vv;
                    
            switch(attributeRule) {
                case '':
                    while(l--) {
                        tmpElement = tmp[l];
                        vv = tmpElement.getAttribute(property);
                        if(vv !== '' && vv !== null) {
                            valueString.unshift(tmpElement);
                        }else if(vv === '') {
                            valueEmptyString.unshift(tmpElement);
                        }else if(vv === null) {
                            valueNull.unshift(tmpElement);
                        }
                    }
                        
                    if(
                        (valueString.length && valueEmptyString.length && valueNull.length) ||
                        (valueString.length && valueEmptyString.length && !valueNull.length) ||
                        (valueString.length && !valueEmptyString.length && valueNull.length) ||
                        (valueString.length && !valueEmptyString.length && !valueNull.length)
                                                                                                ) {
                        elements = valueString;
                    }else if(!valueString.length && valueEmptyString.length && valueNull.length) {
                        elements = valueEmptyString;
                    }else if(
                                (!valueString.length && valueEmptyString.length && !valueNull.length) ||
                                (!valueString.length && !valueEmptyString.length && valueNull.length)
                                                                                                        ) {
                        elements = [];
                    }
                        
                break;
                case '=':
                    while(l--) {
                        tmpElement = tmp[l];
                        if(ignoreCaseSensitiveIfLangAttr(property, tmpElement.getAttribute(property)) === ignoreCaseSensitiveIfLangAttr(property, value)) {
                            elements.unshift(tmpElement);
                        }
                    }
                break;
                case '~=':
                    while(l--) {
                        tmpElement = tmp[l];
                        tmpValue = tmpElement.getAttribute(property);
                        if(tmpValue) {
                            
                            tmpValue = F.trim(tmpValue).split(/\s+/);
                            tmpValueL = tmpValue.length;
                            while(tmpValueL--) {
                                if(ignoreCaseSensitiveIfLangAttr(property, tmpValue[tmpValueL]) === ignoreCaseSensitiveIfLangAttr(property, value)) {
                                    elements.unshift(tmpElement);
                                    break;
                                }
                            }
                            
                        }
                    }
                break;
                case '|=':
                    while(l--) {
                        tmpElement = tmp[l];
                        if(
                            value.indexOf('-') > -1 && 
                            ignoreCaseSensitiveIfLangAttr(property, tmpElement.getAttribute(property)) === ignoreCaseSensitiveIfLangAttr(property, value)
                                                                        ) {
                            elements.unshift(tmpElement);
                        }else {
                            tmpValue = tmpElement.getAttribute(property);
                            if(tmpValue && ignoreCaseSensitiveIfLangAttr(property, tmpValue.split('-')[0]) === ignoreCaseSensitiveIfLangAttr(property, value)) {
                                elements.unshift(tmpElement);
                            }
                        }
                    }
                break;
            }
            return elements;
        }
        
        function ignoreCaseSensitiveIfLangAttr(property, str) {
            if(!str) {
                return;
            }
            if(property === "lang") {
                return str.toLowerCase();
            }else {
                return str;
            }
        }
    }
    */
        
    // 用于造数组
    /**
    * @param {NodeList} nodeList 不是普通的由元素组成的数组
    * @returns {NodeArray | Array} n 个数组混合而成的新数组
    */
    function beArray(nodeList, oneFlag) {
        
        var a = [],
            tmp,
            i = 0,
            l = nodeList.length;
        while(i !== l) {
            if(nodeList[i].nodeType === 1) {
                a.push(nodeList[i]);
                if(oneFlag) {
                    break;
                }
            }
            i++;
        }
        
        return a;
    }
        
    /**
    * @param {StringArray} selectorsArray 选择器字符串数组
    * @param {Node | Document} context 选择器的范围对象（在 context 内获取元素）
    * @param {Boolean} oneFlag 是否只返回结果集的第一个元素，true 是
    * @returns {NodeArray | Array} 元素数组或空数组（如果没有抓取到元素）
    */
    function unique(array, mark) {
       
        var result = [],
            flag = false,
            i,
            tmp,
            l;
        if(array.length === 1) {
            return array;
        }
        while(array.length) {
            tmp = array.shift();
            l = array.length;
            i = 0;
            while(i < l) {
                if(tmp === array[i]) {
                    array.splice(i, 1);
                    i--;
                    flag = true;
                }
                i++;
            }
            if(!flag && mark === 'diff') {
                result.push(tmp);
            }else if(flag && mark === 'same') {
                result.push(tmp);
            }else if(mark === 'union') {
                result.push(tmp);
            }
            flag = false;
        }
        return result;
        
    }
    
    // 将元素逐个绑定至 this
    /**
     * @param {fish} _this fish
     * @param {NodeArray} result 元素数组
     * @return {fish} fish
     */
    function makeThis(_this, result) {
        var i = 0,
            l = result.length;
        for(; i != l; i++) {
            _this[i] = result[i];
        }
        _this.length = l;
        return _this;
    }
    //-----------------------------selector----------------------------->>>>>>>>>>>
    
    var express = {
        match: {
            // 标签、id、类名、伪类、属性的正则表达式用于选择器验证时匹配
            type: /^(?:[a-z]+[1-6]?|[*])/g,
            id: /#-*[_a-zA-Z][-_a-zA-Z0-9]*/g,
            className: /\.-*[_a-zA-Z][-_a-zA-Z0-9]*/g,
            pseudo: /:(?:(?:first|last)-child|lang\(\s*[a-z]{2,2}(?:-[a-zA-Z]{2,2})?\s*\))/g,
            attribute: /\[\s*-*[_a-zA-Z][-_a-zA-Z0-9]*(?:\s*[~|]?=\s*(?:(['"])[^'"]+\1|-*[_a-zA-Z][-_a-zA-Z0-9]*))?\s*\]/g,
            // the follow looks useful
            specialAttributeMap: {
                'class': 'className',
                'for': 'htmlFor'
            }
        },
        // 选择器关系符的正则表达式用于选择器验证时匹配
        relation: /[>+~](?!=|.*["'])/g,
        /**
        * @param {StringArray} processSelectors 是经由 makeSelectorsQueue 划分的选择器字符串数组，如果选择器关系符有误或位置不适当，则抛出异常
        */
        isCombinatorValid: function(processSelectors) {
            var ruleRelation = this.relation,
                l = processSelectors.length,
                current,
                previous,
                next;
                    
            
            if(
                ruleRelation.test(processSelectors[0].charAt(0)) ||
                ruleRelation.test(processSelectors[l - 1].charAt(processSelectors[l - 1].length - 1))
              ) {
                // alert('关系符位置错误');
                this.error();
            }
                
            /*
             * 以下代码检测 >, +, ~ 在选择器字符串中的位置，如果不适当，则抛出选择器错误异常
             */
            while(l--) {
                current = processSelectors[l];
                previous = processSelectors[l - 1];
                next = processSelectors[l + 1];
                if(
                    ruleRelation.test(current) &&
                    (ruleRelation.test(previous) || ruleRelation.test(next))
                  ) {
                    // alert('连续的关系符');
                    this.error();
                }
            }
            
        },
        /** 按 id、标签、类名、伪类、属性、关系符分段，并验证选择器
         * @param {StringArray | String} selectors 选择器字符串
         * @returns {Object | Undefined} 返回一个对象，其每个属性是分段后的选择器字符串，供后续抓取；否则 undefined
         */
        splitSelectors: function(selectors) {
            var id = selectors.match(this.match.id) || '',
                type = selectors.match(this.match.type) || '',
                className = selectors.match(this.match.className) || '',
                pseudo = selectors.match(this.match.pseudo) || '',
                attribute = selectors.match(this.match.attribute) || '',
                relation = selectors.match(this.relation) || '';
            // 以下代码检查选择器字符串的细节，如果不合规范，则抛出选择器错误异常
            if(
                (
                    (id.length ? id.join('') : id) +
                    (type.length ? type.join('') : type) +
                    (className.length ? className.join('') : className) +
                    (pseudo.length ? pseudo.join('') : pseudo) +
                    (attribute.length ? attribute.join('') : attribute) +
                    (relation.length ? relation.join('') : relation)
                ).length !== selectors.length
                                                        ) {
                // alert('语法错误');
                express.error();
            }
                
            return {
                '#': id,
                'tag': type,
                '.': className,
                ':': pseudo,
                '[]': attribute,
                'rel': relation
            }
        },
        error: function () {
            throw new Error('选择器语法错误！');
        }
    };

    /**
    * @description 如果浏览器支持 querySelectorAll 那么 sparrow 以标准方式为基础工作，否则以脚本模拟方式为基础工作
    * @param {String | Node | Nodelist | NodeArray | Document | Window | undefined} [selectors] 选择器字符串，单个节点，nodelist, 节点数组，document，window，甚至是 undefined
    * @param {Node | Document | undefined} [context] 单个节点，仅有一个节点的 nodelist，仅有一个节点的节点数组，document，甚至是 undefined，默认是 document。除了 selectors 是选择器字符串外，对于任何其他 selectors 的参数，context 都必须为 undefined。
    * @param {Boolean} [oneFlag] 是否返回结果集中第一个元素，是 true
    * @returns {NodeArray | Undefined} 返回一个节点数组或空 fish 对象
    */
    var sparrow = doc.querySelectorAll && doc.getElementsByClassName?
        /*
         * 基于标准方式的函数
         */
        function(selectors, context, oneFlag) {
            var roe = F.admin.roe(),
                result = processParameter(selectors, context, 'querySelectorAll', oneFlag);
            if(!result || result.length === 0) {
                roe.length = 0;
                return roe;
            }
            return makeThis(roe, result);
        } : 
        /*
         * 基于脚本模拟方式的函数
         */
        function(selectors, context, oneFlag) {
            var roe = F.admin.roe(),
                iContext,
                iSelectors,
                paramFlag,
                iChunker = /((?::[-a-z]+(?:\([-a-zA-z]+\))?|\[(?:[^\[\]'"]+|['"][^'"]*['"])+\]|[^ >+~,\[\]():]+)+|[>+~])(\s*,\s*)?((?:.)*)/g,
                selectorsQueue,
                i = 0,
                l,
                tmp,
                collector,
                result = [];

            // selectors 和 context 参数处理
            paramFlag = processParameter(selectors, context, undefined, oneFlag);

            // 处理 paramFlag
            // 如果是适当的 context 参数和选择器字符串，则给 iContext 和 iSelectors 赋值
            // 如果是元素数组则直接返回该元素数组
            // 如果是参数处理失败，则直接返回 undefined，并跳出 sparrow
            if(paramFlag) {
                if(paramFlag.selectors && paramFlag.context) {
                    iContext = paramFlag.context;
                    iSelectors = paramFlag.selectors;
                }else {
                    return makeThis(roe, paramFlag);
                }
            }else {
                roe.length = 0;
                return roe;
            }

            // 如果 iContext 和 iSelectors 都是符合要求的值，则分段 iSelectors
            // 选择器分段，如 [ ['.commentsHd'], ['+'], ['.btnPop[href]'] ]，以便后续选择器语法判断和元素抓取
            selectorsQueue = makeSelectorsQueue(iSelectors, iChunker);

            // 选择器语法判断，一旦出错则抛出“选择器语法错误”异常
            l = selectorsQueue.length;
            for(; i !== l; i++) {
                express.isCombinatorValid(selectorsQueue[i]);
            }
            
            // 按选择器字符串分段来抓取元素
            i = 0;
            for(; i !== l; i++) {
                collector = runDigger(selectorsQueue[i], iContext);
                result = result.concat(collector);
            }
            if(oneFlag) {
                result = result[0] ? [result[0]] : result;
            }
            if(l === 1) {
                return makeThis(roe, result);
            }else {
                return makeThis(roe, unique(result, 'union'));
            }

        };
    
    function all(selectors, context) {
        return sparrow(selectors, context)
    }
    
    // 未对结果集排序，使用时需注意，返回元素是否为期望元素
    function one(selectors, context) {
        return sparrow(selectors, context, true);
    }
    
    function dom(selectors, context) {
        return sparrow(selectors, context, true)[0] || null;
    }
    

    //内部处理函数，为addclass
    function _preFormCallBack (fn, elem, nIndex) {
        var ret = fn;
        if (typeof (fn) == "function") {
            ret = fn.call(elem, nIndex);
        }
        return ret;
    }

    // private method for finding a dom element
    function getTag(el) {
        return (el.firstChild === null) ? { 'UL': 'LI', 'DL': 'DT', 'TR': 'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
    }

    function wrapHelper(html, el) {
        if (typeof html == "string") return wrap(html, getTag(el));
        else { var e = document.createElement('div'); e.appendChild(html); return e; }
    }

    // private method
    // Wraps the HTML in a TAG, Tag is optional
    // If the html starts with a Tag, it will wrap the context in that tag.
    function wrap(xhtml, tag) {
        var e = document.createElement('div');
        e.innerHTML = xhtml;
        return e;
    }

    var parseEl = document.createElement('div'),
        speCssStr = "webkitTransform OTransform msTransform MozTransform",
        speCssStrL = " " + speCssStr.toLowerCase() + " ",
        speCss = speCssStr.split(" ");

    function normalize(style) {
        var css, parseCss, rules = [], one, rule, name, i = speCss.length;

        parseEl.innerHTML = "<div style='" + style + "'></div>";
        parseCss = parseEl.childNodes[0].style;
        while(i--){
            if( (rule = parseCss[speCss[i]]) ){
                rules[(rules[rules.length] = speCss[i])] = rule;
            }
        }

        style = style.replace(
            /-([a-z])/g,
            function(str, $1){
                return $1.toUpperCase();
            }
        );

        css = style.split(";");
        for(var n=0; n<css.length; n++){
            one = css[n].split(":");
            if( one[0] && speCssStrL.indexOf(" " + F.trim(one[0].toLowerCase() + " ")) === -1 ){
                name = F.trim(one[0]);
                rules[(rules[rules.length] = name)] = F.trim(one[1]);
            }
        }

        return rules;
    }

    /*
    * Removes all erronious nodes from the DOM.
    *
    */
    function clean(collection) {
        var ns = /\S/;
        collection.each(function (el) {
            var d = el,
            n = d.firstChild,
            ni = -1,
            nx;
            while (n) {
                nx = n.nextSibling;
                if (n.nodeType == 3 && !ns.test(n.nodeValue)) {
                    /*
                        酒店预订 1，可能多标签或少标签，导致 ie 标签结构解析不正确
                        从而导致 clean 的 d.removeChild(n) 错误
                        加 try 只是绕过问题的一个过渡方案
                    */
                    try{
                        d.removeChild(n);
                    }catch(e) {
                        n = nx;
                        continue;
                    }
                    
                } else if(n.nodeIndex != null) {
                    n.nodeIndex = ++ni; // FIXME not sure what this is for, and causes IE to bomb (the setter) - @rem
                }
                n = nx;
            }
        });
    }
    
    
    //hover的获取鼠标移动相关对象
    function fGetEventDoms(e,thatElem){
        var tar = F.getTarget(e), rel = F.getRelated(e);
        while (thatElem !== rel && rel) {
            rel = rel.parentNode;
        }
        while (thatElem !== tar && tar) {
            tar = tar.parentNode;
        }
        return {
            tar:tar,
            rel:rel
        }
    }
    
    
    
    var gHTMLFn = {
        remove:function(el){
            el.parentNode.removeChild(el);
        }, 
        outer:function(wrappedE,el){
            el.parentNode.replaceChild(wrappedE, el);
        }, 
        top:function(wrappedE,el){
             el.insertBefore(wrappedE, el.firstChild);
        }, 
        bottom:function(wrappedE,el){
            el.insertBefore(wrappedE, null);
        }, 
        before:function(wrappedE,el){
             el.parentNode.insertBefore(wrappedE, el);
        }, 
        after:function(wrappedE,el){
             el.parentNode.insertBefore(wrappedE, el.nextSibling);
        }
    
    }

    
    //扩展到fish
    var fns = {
        splice: [].splice,
        all: all,
        /** 参数同 sparrow
        * 但是仅返回结果集中的第一个原生节点
        * 由于返回的元素未做排序处理，使用时需谨慎
        * 必须检查返回的节点是期望的节点
        */
        dom : dom,
        /** 参数同 sparrow
        * 返回的结果集中仅有第一个元素
        * 由于返回的元素未做排序处理，使用时需谨慎
        * 必须检查返回的节点是期望的节点
        */
        one : one,
        /**
        * 后续加入多种query string的支持，如 "input[aid = tc01]"等  目前只支持 ".tclogin" 这样类选择器
        */
    //TODO:bug 不能返回多个父级
        getParent : function(className) {
            var node = this[0],
                hasClassFlag = false;
            if(node) {
                do {
                    node = node.parentNode;
                    if( node && fish.all(node).hasClass(className.substring(1)) ) {
                        return fish.all(node);
                    }
                }while(node !== null)
            }
            var roe = F.admin.roe();
            roe.length = 0;
            return roe;
        },
        //清除fish对象引用
        clear : function(deleteElem, elems){
            if(arguments.length == 0){
                 var i = this.length;
                while(i--){
                    delete this[i];
                }
                this.length = 0;
                delete this.object;
                return this;
            }else{
                var elems = elems ? elems : this,
                    isDeleteFn = null,
                    theDeleElems = null;
                if (typeof (deleteElem) === "function") {
                    isDeleteFn = deleteElem;
                    elems.each(function () {
                        if (isDeleteFn()) {
                            _removeSingleElem(elems, this);
                        }
                    });

                } else if (typeof (deleteElem) === "string" || (typeof(deleteElem) === "object" && deleteElem.inWater) || (typeof(deleteElem) === "object" && deleteElem.nodeType === 1)) {//后两个判断是否是fish或dom
                    theDeleElems = fish.all(deleteElem);
                    theDeleElems.each(function () {
                        _removeSingleElem(elems, this);
                    });
                }

            }
            //TODO:优化下，不要在这里放函数
            function _removeSingleElem(elems, theDeleteOne) {
                var indexOfDeleOne = _indexOf(elems, theDeleteOne),
                        index = indexOfDeleOne,
                        length = elems.length;
                if (indexOfDeleOne > -1) {
                    while (index < length - 1) {
                        elems[index] = elems[index + 1];
                        index++;
                    }
                    elems.length--;
                }
            };
            function _indexOf(elems, theDeleteOne) {
                var indexOfDeleOne = -1;
                theDeleteOne = fish.dom(theDeleteOne);
                elems.each(function (elem, index) {
                    if (this == theDeleteOne) {
                        indexOfDeleOne = index;
                        return false;
                    }
                });
                return indexOfDeleOne;
            }

           
        },
        each : function(fn){
            for (var i = 0, len = this.length; i < len; ++i) {
                if (fn.call(this[i], this[i], i, this) === false){ break; }
            }
            return this;
            //return [].forEach.apply(this, arguments);
        },
        //      修改为hasClass全部验证包含时才返回true
        hasClass: function (value) {
            if(!value || !this[0]){return false;}
            var classStr, classNames;
            for (var i = 0; i < this.length; i++) {
                classNames = F.trim(_preFormCallBack(value, this[i], i)).split(/\s+/)
                classStr = " " + F.trim(this[i].className) + " ";
                //添加多class的判断
                //为什么不用foreach？因为坑爹的不能中止循环
                var j = classNames.length;
                while(j--){
                    //不使用正则，慢了点
                    if(classStr.indexOf(" " + classNames[j] + " ") === -1){
                        return false;
                    }
                }
            }
            return true;
        },
        addClass: function (value) {
            var classNames, setClass;
            for (var i = 0; i < this.length; i++) {
                classNames = F.trim(_preFormCallBack(value, this[i], i)).split(/\s+/);
                setClass = " " + F.trim(this[i].className) + " ";
                for (var c = 0, cl = classNames.length; c < cl; c++ ) {
                    //!~这个是把-1变成0的超级方法，至于效率嘛，对面的你可以测试下，如果效率不好，就换成 != -1
                    if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
                        setClass += classNames[ c ] + " ";
                    }
                }
                this[i].className = F.trim( setClass );
            }
            return this;
        },
        removeClass: function (value) {
            var classNames, setClass;
            for (var i = 0; i < this.length; i++) {
                classNames = F.trim(_preFormCallBack(value, this[i], i)).split(/\s+/);
                setClass = " " + F.trim(this[i].className) + " ";
                for (var j = 0; j < classNames.length; j++) {
                    //这样快点
                    setClass = setClass.replace(" " + classNames[j] + " ", " ");
                }
                this[i].className = F.trim(setClass);
            }
            return this;
        },
        on: function (type, fn, query) {
            if(!fn) return;
            var fObj = this.length != null ? this : fish.all(query);
            for (var i = 0; i < fObj.length; i++) {
                if (fObj[i].addEventListener) {
                    fObj[i].addEventListener(type, fn, false);
                } else if (fObj[i].attachEvent) {
                    var IE5 = (function (elem) {
                        return function () {
                            fn.call(elem);
                        }
                    })(fObj[i]);
                    fObj[i].attachEvent("on" + type, IE5);
                } else {
                    fObj[i]["on" + type] = fn;
                }
            }
            return this;
        },
        /**
         *一个模仿悬停事件，鼠标移动和移出对象的方法。提供保持其中的状态
         *@param {Function}  overcall 鼠标移上出发的函数
         *@param {Function}  outcall 鼠标移上出发的函数
         **/
        hover: function (overcall, outcall) {
            var that;
            for (var n = 0; n < this.length; n++) {
                that = this[n];
                (function (thatElem) {
                    F.on("mouseover", function (e) {
                        var elemObj=fGetEventDoms(e,thatElem);
                        //related必须是undefined，才能保证是从元素外部over
                        if (thatElem === elemObj.tar && !elemObj.rel) {
                            overcall && overcall.call(thatElem, e);
                        }
                    }, thatElem);

                    F.on("mouseout", function (e) {
                        var elemObj=fGetEventDoms(e,thatElem);
                        //related必须是undefined，才能保证移出到外部
                        if (elemObj.tar && !elemObj.rel) {
                            outcall && outcall.call(thatElem, e);
                        }
                    }, thatElem);

                })(that)
            }
        },

        /**
        * 内置异步执行方法体
        * @param {string} type 返回参数格式 string/json 默认string
        * @param {string} openType 提交格式 get/post 默认get
        * @param {string} url 提交地址 (必填)
        * @param {string} data 提交参数
        * @param {Obj} fn 回调函数体
        * @param {Obj} err 回调函数体
        * @param {bollean} cache get是否缓存 
        */
        ajax : function (param) {
            var xmlhttp = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest(),
            type = param.type ? param.type : "string",
            openType = param.openType ? param.openType : "get",
            url = param.url,
            fn = param.fn,
            err = param.err,
            urlSend = url,
            data = param.data,
            onTimeout = param.onTimeout,
            isErrFunExc = false,//错误回调是否执行过，保证错误回调只执行一次
            //error = false,
            timeout = param.timeout ? param.timeout : 16000;
            
            if(!url){
                return;
            }
            function onreadystatechange() {
                if (xmlhttp.readyState == 4 &&
                    (( xmlhttp.status >= 200 && xmlhttp.status <= 300) ||  xmlhttp.status == 304) ) {
                    clearTimeout(param.timer);
                    if (type === "json") {
                        fn && fn( (new Function("return " + xmlhttp.responseText))() );
                    } else {
                        fn && fn(xmlhttp.responseText);
                    }
                } else if(xmlhttp.readyState == 4){
                    clearTimeout(param.timer);
                    if(!isErrFunExc){
                        err && err();
                        isErrFunExc = true;
                    }
                    
                }
            }

            if(urlSend.indexOf("#") > 0){           //  判断有没有"#"  ，有的话  去掉"#"后面所有字符
                urlSend = urlSend.substring(0,urlSend.indexOf("#"));
            }
            if(urlSend.indexOf("?") > 0 && urlSend.indexOf("?") == urlSend.length - 1){           //  去点最后一个问号
                urlSend = urlSend.substring(0,urlSend.indexOf("?"));
            }
            
            function fixUrlSend(urlSend, data){
                var urlD = urlSend;
                if(data){          //  没有问号  在最后面加上问题
                    if(urlSend.indexOf("?") < 0){
                        urlD = urlD + "?";
                    }
                    else if(urlSend.charAt(urlSend.length-1) != "?"){            //  如果有问题后 切问号不在最后面  加上"&"
                        urlD = urlD + "&";
                    }
                    urlD = urlD + data;
                } 
                return urlD;
            }
            
            
            if(param.type === "jsonp"){
                var RandomFn = param.jsonpCallback ? param.jsonpCallback : ("tc" + parseInt(100000000000*Math.random()));
                urlSend = fixUrlSend(fixUrlSend(urlSend, param.data), "callback=" + RandomFn);
                window[RandomFn] = function(e){
                    fn && fn(e);
                }
                var creScr = document.createElement("script");
                creScr.type = "text/javascript";
                creScr.src = urlSend;
                document.getElementsByTagName("head")[0].appendChild(creScr);

            }
            else if(param.type === "script"){
                var creScr = document.createElement("script");
                creScr.type = "text/javascript";
                urlSend = fixUrlSend(urlSend, param.data);
                urlSend.onreadystatechange = urlSend.onload = function(){
                    var state = urlSend.readyState;
                    if (!state || /loaded|complete/.test(state)) {
                        urlSend.onreadystatechange = urlSend.onload = null;
                        fn && typeof fn === "function" && fn();
                    }
                };
                creScr.src = urlSend;
                document.getElementsByTagName("head")[0].appendChild(creScr);
            } else if (openType === "get") {
                if (!param.cache) {
                    urlSend = fixUrlSend(fixUrlSend(urlSend, param.data), "iid=" + Math.random());
                }
                else {
                    urlSend = fixUrlSend(urlSend, param.data);
                }
                xmlhttp.open(openType, urlSend, true);
                xmlhttp.onreadystatechange = onreadystatechange;
                xmlhttp.send(null);
            } else if (openType === "post") {
                xmlhttp.open(openType, urlSend, true);
                xmlhttp.onreadystatechange = onreadystatechange;
                xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                xmlhttp.send(param.data);
            }
            
            //if(!error){
            clearTimeout(param.timer);
            param.timer = setTimeout(function(){
                if(xmlhttp.readyState !== 4){
                    onTimeout && onTimeout();
                    xmlhttp.abort();
                    if(!isErrFunExc){
                        err && err();
                        isErrFunExc = true;
                    }
                }
            },timeout);
            //}
           
            return xmlhttp;
        },
        /**
        * 获取event对象
        * @param {Object} event 触发的event对象
        */
        getEvent : function (event) {
            return event ? event : win.event;
        },
        /**
        * 获取event的底层目标
        * @param {Object} event 触发的event对象
        */
        getTarget : function (event) {
            var e = F.getEvent(event);
            return e.target || e.srcElement;
        },
        /**
        * 阻止事件冒泡
        */
        stopBubble: function (event) {
            var e = F.getEvent(event);
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                e.cancelBubble = true;
            }
        },
        /**
        * 获取event的底层目标
        * @param {Object} event 触发的event对象
        */
        getRelated : function (event) {
            var e = F.getEvent(event);
            switch(e.type){
                case "mouseover":
                    return e.relatedTarget || e.fromElement || e.toElement;
                default:
                    return e.relatedTarget || e.toElement || e.fromElement;
            }
        },
        /**
        * 禁止目标元素默认事件动作
        * @param {Object} event 目标元素的事件对象
        */
        preventDefault : function (event) {
            var e = F.getEvent(event);
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },

        //TODO:之后的验证对象使用这个名称来做,目前就两个硬方法
        valida : {
            email : function(value){
                var s = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,6})+$/;
                return s.test(F.trim(value));
            },
            phone : function(value){
                var s = /^(13|14|15|18)[0-9]{9}$/;
                return s.test(F.trim(value));
            }
        },
        //设置样式表, 包含一个处理函数 normalize
        css: function(){
            function main (style) {
                var css = normalize(style);
                return this.each(function (el) {
                    var i = css.length;
                    while(i--){
                        el.style[css[i]] = css[css[i]];
                    }
                });
            }
            main.normalize = normalize;
            return main;
        }(),
        getCss : function(rule){
            return this[0] && getRealStyle(this[0], rule);
        },
        cookie : {
            /**
            * 添加cookie
            * name,(名称) value(值), days(保存天数),hours(保存小时),minutes(保存分钟),seconds(保存秒), path(路径),domain(权限),code(是否编码)
            * @param {Object} param
            */
            set: function (name, value, days) {
                var param = name;
                if(typeof name === "string"){
                    var arg = arguments;
                    param = {};
                    param.name = arg[0];
                    param.value = arg[1];
                    param.days = arg[2];
                    param.path = arg[3];
                    param.domain = arg[4];
                    param.encode = arg[5];
                }
                if(param.value != null) {
                    //cookie存储日期
                    var date = new Date(), expires;
                    if (param.days) {
                        date.setDate(date.getDate() + parseInt(param.days,10));
                    }
                    if (param.hours) {
                        date.setHours(date.getHours() + parseInt(param.hours,10));
                    }
                    if (param.minutes) {
                        date.setMinutes(date.getMinutes() + parseInt(param.minutes,10));
                    }
                    if (param.seconds) {
                        date.setSeconds(date.getSeconds() + parseInt(param.seconds,10));
                    }

                    //默认存储日期
                    if (!param.days && !param.hours && !param.minutes && !param.seconds) {
                        expires = "";
                    }
                    else{
                        expires = "; expires=" + date.toGMTString();
                    }
                    //cookie值
                    var cookieValue = param.value;
                    if (param.encode != false) {
                        cookieValue = encodeURIComponent(param.value)
                    }
                    var str = param.name + "=" + cookieValue + expires; //"; expires=" + date.toGMTString();
                    if (param.path) {
                        str += ";path=" + param.path;
                    }
                    if (param.domain) {
                        str += ";domain=" + param.domain;
                    }
                    doc.cookie = str;
                }
            },
            /**
            * 获取cookie
            * @param {String} name cookie名
            * @param {String} childName cookie子健名
            */
            get: function (name, childName) {
                if (doc.cookie && doc.cookie != '') {
                    var str, strA, op = null;
                    //TODO:what`s this??? herrrrr?
                    //var op = doc.cookie.substring(start, end).replace(/[+]/g, '%20');
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = F.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            //如果没有子键，就解码，否则，先不进行解码
                            if (!childName) {
                                try { op = decodeURIComponent(cookie.substring(name.length + 1)); }
                                catch (e) {op = "";}
                            }
                            else {
                                op = cookie.substring(name.length + 1);
                            }
                            break;
                        }
                    }
                    if(op) {
                        try{
                            str = decodeURIComponent(op);
                        }
                        catch(e){
                            str = op;
                        }
                    }
                    //str = op;
                    if (childName && op) {
                        strA = op.split("&");
                        //匹配不到子cookie， 就返回null
                        str = null;
                        for (var i = 0; i < strA.length; i++) {
                            strA[i] = F.trim(strA[i]);
                            if (strA[i].substring(0, childName.length + 1) == (childName + '=') ){
                                //return strA[i].substring(childName.length + 1);
                                try {
                                    str = decodeURIComponent(strA[i].substring(childName.length + 1));
                                }
                                catch (e) {
                                    str = "";
                                }
                                break;
                            }
                        }
                    }
                    return str;

                }
            }
        },

        //TODO:当然是少了注释了
        attr : function(name, value){
            if(value != null){
                this.each(function(elem){
                    elem.setAttribute(name, value);
                })
            }
            else{
                return this[0] && this[0].getAttribute(name);
            }
        },

        //TODO:当然是少了注释了
        val : function(value){
            if(value != null){
                this.each(function(elem){
                    elem.value = value;
                })
            }
            else{
                return this[0] && this[0].value;
            }
        },
        //交互效果
        effect : function(param){
            var def = {
                elem : "",
                type : "click",
                interShow : true,
                outerHide : true,
                interFn : null,
                outerFn : null
            };
            F.lang.extend(def, param);
            var id = F.guid(), that = this, elems = F.all(def.elem), timer;
            function setId (elem){
                elem["_effect_" + id + "_"] = true;
            }
            function showFn(){
                if(that.getCss("display") === "none"){
                    def.interFn && def.interFn.call(that);
                    def.interShow && that.css("display:block");
                }            
            }
            function hideFn(){
                if(that.getCss("display") === "block"){
                    def.outerFn && def.outerFn.call(that);
                    def.outerHide && that.css("display:none");
                }      
            }

            function overFn(){
                clearTimeout(timer);
                timer = setTimeout(showFn, 0);
            }
            function outFn(){
                clearTimeout(timer);
                timer = setTimeout(hideFn, 0);
            }
            elems.each(setId);
            this.each(setId);

            switch (def.type){
                case "click":
                    F.one(document).on("click", function(e){
                        var tar = F.getTarget(e);
                        while(tar && !tar["_effect_" + id + "_"]){
                            tar = tar.parentNode;
                        }
                        //点击交互发生在元素节点内
                        if(tar){overFn()}//使用支持timeout的overfn，来保证多元素的支持
                        else{hideFn()}
                    })
                break;
                case "hover":
                    elems.hover(overFn, outFn);
                    this.hover(overFn, outFn);
                break;
                case "focusBlur":
                    elems.on("focus",overFn);
                    elems.on("blur",outFn);
                break;
            }
            return this;
        },
        /**
         * 改变html的函数，from XUI
         * @param {String} location 需要更改的html的内容，可以是html字符串，或者fish对象，或者原生节点
         * @param {String} html
             .html('inner', '<strong>rock and roll</strong>');   节点内部
             .html('outer', '<p>lock and load</p>');             节点外部
             .html('top',   '<div>bangers and mash</div>');      节点内的最上面
             .html('bottom','<em>mean and clean</em>');          节点内的最下面
             .html('remove');                                    移除节点
             .html('before', '<p>some warmup html</p>');         节点外的上面
             .html('after',  '<p>more html!</p>');               节点外的下面
         */
        html: function (location, html) {
            var legalArr = ["inner","outer","top","bottom","remove","before","after"];
            clean(this);
            //that[location](html);
            if (arguments.length == 0) {
                return this[0] ? this[0].innerHTML : undefined;
            }
            if (arguments.length == 1 && arguments[0] != 'remove') {
                html = location;
                location = 'inner';
            }
        if(arguments.length == 2 && !_isArgIlegal(location, legalArr)){
            return this;
        }
            if (location != 'remove' && html && html.each !== undefined) {//如果html是个fish数组
                if (location == 'inner') {
                   var d = document.createElement('p');
                   html.each(function (el) {
                       d.appendChild(el);
                   });
                   this.each(function (el) {
                       el.innerHTML = d.innerHTML;
                   });
                } else {
                   var that = this;
                   html.each(function (el) {
                       that.html(location, el);
                   });
                }
                return this;
            }
            return this.each(function (el) {
                var parent,
                    list,
                    len,
                    i = 0;
                if (location == "inner") { // .html
                   if (typeof html == "string" || typeof html == "number") {
                       el.innerHTML = html;
                       list = el.getElementsByTagName('SCRIPT');
                       len = list.length;
                       for (; i < len; i++) {
                           eval(list[i].text);
                       }
                   } else {
                       el.innerHTML = '';
                       //TODO:支持fish对象等的append
                       el.appendChild(html);
                   }
                } else {
                   if (location == 'remove') {
                       gHTMLFn[location](el);
                   } else {
                       var  elArray = ['outer', 'top', 'bottom'],
                            wrappedE = wrapHelper(html, (elArray.toString().indexOf(location) > -1 ? el : el.parentNode)),
                            children = wrappedE.childNodes;
                       if(!gHTMLFn[location]){
                          return;
                       }
                       gHTMLFn[location](wrappedE, el);
                       var parent = wrappedE.parentNode;
                       while (children.length) {
                           parent.insertBefore(children[0], wrappedE);
                       }
                       parent.removeChild(wrappedE);
                   }
                }
            });
        },
        //浏览器
        browser : function (name, version){
            if(name){
                var re = true;
                if(name !== browser.name) re = false;
                if(version && name === browser.name && version !== parseInt(browser.version, 10) ) re = false;
                return re;
            }
            else{
                return browser;
            }
        },
         //时间的操作
        parseTime:function(string, tParam, getObj) {
            _parseTime_.hasCallOnce = false;
            return _parseTime_(string, tParam, getObj);
        },
        parseDate:function(string, param) {
             var dateObj = F.parseTime(string, param, true);
            return new Date(pint(dateObj.y), pint(dateObj.m) - 1, pint(dateObj.d), pint(dateObj.h), pint(dateObj.mi), pint(dateObj.s));
        }
    }


    //时间操作会用到的辅助函数
    function _parseTime_(string, tParam, getObj) {
        var rHourAndMin = /\s(\d+):?(\d+)?:?(\d+)?/, //  XXX时分秒需可配置的传入
        hourAndMinRes;
        /** sadhu 2012.9.26
         * 输入验证比较宽泛，但其后的操作比较特殊
         * 建议对需要特殊操作的输入做比较严格的验证
         * 对于 null，此次简单处理
         */
        if (typeof string === "object" && string !== null) {
            var y = string.getFullYear(),
                m = string.getMonth() + 1,
                d = string.getDate(),
                h = string.getHours(),
                mi = string.getMinutes(),
                s = string.getSeconds();
        }
        else {
            string = string ? string : "";
            hourAndMinRes = rHourAndMin.exec(string);
            var s = string.split("-"),
                y = parseInt(s[0], 10),
                m = parseInt(s[1], 10),
                d = parseInt(s[2], 10),
                h = 0,
                mi = 0,
                s = 0;
            if (hourAndMinRes) {
                if (hourAndMinRes[1]) {
                    h = parseInt(hourAndMinRes[1], 10);
                }
                if (hourAndMinRes[2]) {
                    mi = parseInt(hourAndMinRes[2], 10);
                }
                if (hourAndMinRes[3]) {
                    s = parseInt(hourAndMinRes[3], 10);
                }

            }
        }
        var date = new Date(),
            temp,
            param = {
                years: 0,
                months: 0,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                timeMode: null
            };

        //有效日期
        if (y && m && d) {
            fish.lang.extend(param, tParam);
            //增量
            y = y + param.years;
            m = m + param.months;
            d = d + param.days;
            h = h + param.hours;
            mi = mi + param.minutes;
            s = s + param.seconds;

            temp = new Date(y, m - 1, d, h, mi, s);
            y = temp.getFullYear();
            m = temp.getMonth() + 1;
            d = temp.getDate();
            h = temp.getHours();
            mi = temp.getMinutes();
            s = temp.getSeconds();



            m = m < 10 ? ("0" + m) : m;
            d = d < 10 ? ("0" + d) : d;
            h = h < 10 ? ("0" + h) : h;
            mi = mi < 10 ? ("0" + mi) : mi;
            s = s < 10 ? ("0" + s) : s;

            var rt;
            //特使格式
            if (param.timeMode) {
                rt = param.timeMode
                .replace("YYYY", y)
                .replace("MM", m)
                .replace("DD", d)
                .replace("hh", h)
                .replace("mm", mi)
                .replace("ss", s);
            }
            else {
                rt = [y, m, d].join("-");
            }
            rt = getObj ? { y: y, m: m, d: d, h: h, mi: mi, s: s} : rt;
            return rt;
        }
        else if (!arguments.callee.hasCallOnce) { //无效日期,直接返回今天的日期
            arguments.callee.hasCallOnce = true;
            return arguments.callee([date.getFullYear(),
                            date.getMonth() + 1,
                            date.getDate()].join("-"), tParam, getObj);
        }
    }
    //时间操作会用到的辅助函数
    function pint(str) {
        return parseInt(str, 10);
    }
    /**
     *
     * @param {Object} value 待验证是否合法的值
     * @param {Object} legalArr 数组：所有合法值
     */
    function _isArgIlegal(value, legalArr){
        // 为了代码量少，谁让是javascript
        //- 哦，我认为楼上用的是 java 科技 ^_^
        //- ~(not 非)不小于 0 的数，结果均为负数，!!负数 均为 true
        //- ~负 1，结果为 0，!!0 为 false
        return !!~legalArr.indexOf(value);
    }




    function offsetInit () {
        var body = document.body,
            container = document.createElement("div"),
            innerDiv, checkDiv, table, td, bodyMarginTop = 0,
            html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
        var divcss = { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" };
        for (var k in divcss) {
            container.style[k] = divcss[k];
        }
        container.innerHTML = html;
        body.insertBefore(container, body.firstChild);
        innerDiv = container.firstChild;
        checkDiv = innerDiv.firstChild;
        td = innerDiv.nextSibling.firstChild.firstChild;

        this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
        this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

        checkDiv.style.position = "fixed"; checkDiv.style.top = "20px";
        // safari subtracts parent border width here which is 5px
        this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
        checkDiv.style.position = checkDiv.style.top = "";

        innerDiv.style.overflow = "hidden"; innerDiv.style.position = "relative";
        this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

        this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

        body.removeChild(container);
        body = container = innerDiv = checkDiv = table = td = null;
    }

    if ("getBoundingClientRect" in document.documentElement) {
        fns.offset = function (parentQuery) {
            var pOffset,
                top = 0,
                left = 0;
            if (parentQuery) {
                pOffset = F.one(parentQuery).offset();
            }
            var length = this.length, elem, returnValue;
            elem = this[0];

            if(elem && elem.getBoundingClientRect){
                var box;
                try{
                    box = elem.getBoundingClientRect();
                    var doc = elem.ownerDocument,
                        body = doc.body,
                        docElem = doc.documentElement,
                        clientTop = docElem.clientTop || body.clientTop || 0,
                        clientLeft = docElem.clientLeft || body.clientLeft || 0;
                    top = box.top + (self.pageYOffset || browser.boxModel && docElem.scrollTop || body.scrollTop) - clientTop;
                    left = box.left + (self.pageXOffset || browser.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
                }
                catch(e){
                    //来点东西记录一下吧
                    top = 0; left = 0;
                }
            }
            return {    top: pOffset ? top - pOffset.top : top,
                        left: pOffset ? left - pOffset.left : left
            };
        }
    }
    else {
        offsetInit();
        fns.offset = function (parentQuery) {
            var pOffset;
            if (parentQuery) {
                pOffset = F.one(parentQuery).offset();
            }
            var length = this.length, elem, returnValue;
            elem = this[0];
            if(elem){
                var offsetParent = elem.offsetParent,
                        prevOffsetParent = elem,
                        doc = elem.ownerDocument,
                        computedStyle,
                        docElem = doc.documentElement,
                        body = doc.body,
                        defaultView = doc.defaultView,
                        prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle,
                        top = elem.offsetTop, left = elem.offsetLeft;

                while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
                    if (offsetInit.supportsFixedPosition && prevComputedStyle.position === "fixed") {
                        break;
                    }

                    computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                    top -= elem.scrollTop;
                    left -= elem.scrollLeft;

                    if (elem === offsetParent) {
                        top += elem.offsetTop;
                        left += elem.offsetLeft;

                        if (offsetInit.doesNotAddBorder && !(offsetInit.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName))) {
                            top += parseFloat(computedStyle.borderTopWidth) || 0;
                            left += parseFloat(computedStyle.borderLeftWidth) || 0;
                        }

                        prevOffsetParent = offsetParent; offsetParent = elem.offsetParent;
                    }

                    if (offsetInit.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
                        top += parseFloat(computedStyle.borderTopWidth) || 0;
                        left += parseFloat(computedStyle.borderLeftWidth) || 0;
                    }

                    prevComputedStyle = computedStyle;
                }

                if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
                    top += body.offsetTop;
                    left += body.offsetLeft;
                }

                if (offsetInit.supportsFixedPosition && prevComputedStyle.position === "fixed") {
                    top += Math.max(docElem.scrollTop, body.scrollTop);
                    left += Math.max(docElem.scrollLeft, body.scrollLeft);
                }
            }
            return {    top: pOffset ? top - pOffset.top : top,
                        left: pOffset ? left - pOffset.left : left
            };
        }
    }

    /**
     * 获取计算样式值
     * @param {Element} el 元素节点
     * @param {String} styleProp 样式名称
     */
    function getRealStyle(el, styleProp) {
        return el.currentStyle ?
            el.currentStyle[styleProp] :
            doc.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    }

    "width height".split(" ").forEach(function(name, i){
        var param = i ? "Height" : "Width";
        fns[name] = function(domQuery){
            var elem = domQuery ? this.dom(domQuery) : this[0], rt;

            try{
                if (elem === win) {
                    var de = doc.documentElement;
                    rt = self["inner" + param] || (de && de["client" + param]) || doc.body["client" + param];
                }
                else if (elem === doc) {
                    rt = doc.body["scroll" + param];
                }
                //为none时获取不到宽度
                else if (getRealStyle(elem, "display") !== "none") {
                    rt = elem["offset" + param] || elem["client" + param];
                }
                else {
                    var style = elem.style,
                        temp =  style.display;
                    style.display = "block";
                    rt = elem["offset" + param] || elem["client" + param];
                    style.display = temp;
                }
            }
            catch(e){
                rt = 0;
                //需要给bubuger一个异常捕获的信息，幽灵节点传入
            }
            return rt;
        }
    });

    //直接事件绑定
    "click mouseover mouseout submit focus blur keydown keypress keyup change".split(" ").forEach(function(name, i){
        fns[name] = function(fn){return F.on(name, fn);}
    });



    //滚动条位置 scrollL & scrollT
    "Left Top".split(" ").forEach(function (name, i) {
        var method = i ? "scrollTop" : "scrollLeft";
        fns["scroll" + name] = function (domQuery) {
            var elem = domQuery ? this.dom(domQuery) : this[0], rt;
            //如果是win
            if(elem){
                elemN = elem && typeof elem === "object" && "setInterval" in elem ?
                    elem :
                    elem.nodeType === 9 ?
                        elem.defaultView || elem.parentWindow :
                        false;
                rt =    elemN ?
                        ("pageXOffset" in elemN) ? elemN[i ? "pageYOffset" : "pageXOffset"] :
                            browser.boxModel && elemN.document.documentElement[method] ||
                                elemN.document.body[method] :
                        elem[method];
                return rt;
            }

        }

    });

    //扩展fish
    fish.extend(fns, true);




    // Useragent RegExp
    var rwebkit = /(webkit)[ \/]([\w.]+)/,
        //rsafari = /(safari)[ \/]([\w.]+)/,
        //rchrome = /(chrome)[ \/]([\w.]+)/,
        ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
        rmsie = /(msie) ([\w.]+)/,
        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;


    var userAgent = navigator.userAgent,
        ua = userAgent.toLowerCase();

    var match =
        //rchrome.exec(ua) ||
        //rsafari.exec(ua) ||
        rwebkit.exec(ua) ||
        ropera.exec(ua) ||
        rmsie.exec(ua) ||
        ( ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ) ||
        [];

    match[1] = match[1].replace("msie", "ms").replace("mozilla", "moz").replace("opera", "o");
    match[2] = parseFloat(match[2], 10);

    var browser = { name: match[1] || "", version: match[2] && parseFloat(match[2]) || 0, boxModel: false }

    //检测浏览器支持情况
    F.ready && F.ready(function () {
        var div = document.createElement("div");
        div.style.width = div.style.paddingLeft = "1px";
        document.body.appendChild(div);
        browser.boxModel = div.offsetWidth === 2;
        div.parentNode.removeChild(div);
        div = null;
    })


})();
//-------------------------------------Mount end----------------------->>>>>>>>>>>>

//<<--------------------------extend model


// ----------------------template form doT.js
// 2011, Laura Doktorova, https://github.com/olado/doT
//
// doT.js is an open source component of http://bebedo.com
// Licensed under the MIT license.
// http://olado.github.com/doT/
//
(function() {
    "use strict";
    var doT = {
        version: '0.2.0',
        templateSettings: {
            evaluate:    /\{\{([\s\S]+?)\}\}/g,
            interpolate: /\{\{=([\s\S]+?)\}\}/g,
            encode:      /\{\{!([\s\S]+?)\}\}/g,
            use:         /\{\{#([\s\S]+?)\}\}/g,
            define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
            conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
            iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
            varname: 'it',
            strip: true,
            append: true,
            selfcontained: false
        },
        cache:{}, //模板函数缓存
        template: undefined //fn, compile template
    };


    var startend = {
        append: { start: "'+(",      end: ")+'",      startencode: "'+fish.encodeHTML(" },
        split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=fish.encodeHTML("}
    }, skip = /$^/;

    function resolveDefs(c, block, def) {
        return ((typeof block === 'string') ? block : block.toString())
            .replace(c.define || skip, function(m, code, assign, value) {
            if (code.indexOf('def.') === 0) {
                code = code.substring(4);
            }
            if (!(code in def)) {
                if (assign === ':') {
                    def[code] = value;
                } else {
                    def[code] = (new Function("def", "return " + value))(def);
                }
            }
            return '';
        })
        .replace(c.use || skip, function(m, code) {
            
            if(code === "def.temp"){
                throw new Error("forbin def.temp in template");
            }
            var v;
            if(code.indexOf('def.') === 0){
                v = def[code.substring(4)];
            }
            else{
                v = eval(code);
            }

            return v ? resolveDefs(c, v, def) : v;

        });
    }

    function saveToCache(str, data){
        doT.cache[str] = data;
    }
    function getFromCache(str){
        return doT.cache[str];
    }

    function unescape(code) {
        return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, ' ');
    }

    doT.template = function(tmpl, def) {
        var c = doT.templateSettings, cacheString, cacheFn;

        var cse = c.append ? startend.append : startend.split, str, needhtmlencode, sid=0, indv;

        if(def){
            //这个情况不会直接查缓存，所以先解析 def
            str = resolveDefs(c, tmpl, def);
            if(!(cacheFn = getFromCache(str))){
                //没有命中缓存，保存缓存字符串
                cacheString = str;
            }
        }
        else{
            //这个可以直接查缓存
            if(!(cacheFn = getFromCache(tmpl))){
                //没有命中缓存，保存缓存字符串
                cacheString = tmpl;
                //然后开始解析
                str = resolveDefs(c, tmpl, {});
            }
        }

        //如果前面都没有命中缓存
        if(!cacheFn){
            str = ("var out='" + (c.strip ? str
                                    .replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g,' ')
                                    .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,''): str)
                .replace(/'|\\/g, '\\$&')
                .replace(c.interpolate || skip, function(m, code) {
                    return cse.start + unescape(code) + cse.end;
                })
                .replace(c.encode || skip, function(m, code) {
                    needhtmlencode = true;
                    return cse.startencode + unescape(code) + cse.end;
                })
                .replace(c.conditional || skip, function(m, elsecase, code) {
                    return elsecase ?
                        (code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
                        (code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
                })
                .replace(c.iterate || skip, function(m, iterate, vname, iname) {
                    if (!iterate) return "';} } out+='";
                    sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
                    return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
                        +vname+"=arr"+sid+"["+indv+"+=1];out+='";
                })
                .replace(c.evaluate || skip, function(m, code) {
                    return "';" + unescape(code) + "out+='";
                })
                + "';return out;")

                .replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
                .replace(/(\s|;|}|^|{)out\+='';/g, '$1').replace(/\+''/g, '')
                .replace(/(\s|;|}|^|{)out\+=''\+/g,'$1out+=');
        }



        try {
            if(!cacheFn){
                cacheFn = new Function(c.varname, str);
                saveToCache(cacheString, cacheFn);
            }
            return cacheFn;
        } catch (e) {
            if (typeof console !== 'undefined') console.log("Could not create a template function: " + str);
            throw e;
        }
    };

    function templateFn(dom, data){
        var temp = dom.temp;
        if(typeof dom === "string"){
            if(data){
                return doT.template(dom)(data);
            }else{
                return doT.template(dom);
            }
        }else if(typeof dom === "object"){
            fish.lang.extend(doT.templateSettings, dom);
            if(data){
                return doT.template(temp, dom)(data);
            }else{
                return doT.template(temp, dom);
            }
        }
    }

    fish.extend({
        template : templateFn,
        encodeHTML : (function() {
            var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },
                matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
            return function(code) {
                return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : code;
            };
        })()
    }, true);

}());

// template-end -----------------------

//extend model--------------------------->>

})(document, window)


