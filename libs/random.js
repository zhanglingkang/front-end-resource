(function  (ctx) {
    if(!ctx.tool) {
        ctx.tool = {};
    }
    var tool = ctx.tool; 
    var UPPERCASE_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var LOWER_ALPHA = 'abcdefghijklmnopqrstuvwxyz';
    var ALL_ALPHA = LOWER_ALPHA + UPPERCASE_ALPHA;
    var TYPE_LOWER_ALPHA_ONLY = 0; 
    var TYPE_UPPER_ALPHA_ONLY = 1; 
    var TYPE_ALL_ALPHA = 2;

    var random = Math.random; 


    /*
    * 生成随机字母
    */
    tool.makeRandomAlpha = function(alphaNum, option) {
        alphaNum = isNaN(alphaNum) ? 1 : parseInt(alphaNum);
        alphaNum = alphaNum <= 0 ? 1 : alphaNum;
        var type = TYPE_LOWER_ALPHA_ONLY;
        option = option || {};
        if(option.allowUpperCase === true) {
            type = TYPE_UPPER_ALPHA_ONLY;
        }
        if(option.allowAll === true) {
            type = TYPE_ALL_ALPHA;
        }
        var strArr = [];
        for(var i = 0; i < alphaNum; i++) {
            strArr.push(makeOneRandomAlpha(type));
        }
        return strArr.join('');

    };

    /*
    * 随机取数组中的某个元素
    */
    tool.randomItemInArr = function(arr){
        if(!isArray(arr)) {
            console.error('param@arr: %s shoule be array',arr);
            throw new Error('param@arr shoule be array');
        }
        var len = arr.length;
        var randomIndex = parseInt(len * random(), 10);
        return arr[randomIndex];
    };

     /*
    * 随机取数组中的某个元素 [min,max)
    */
    tool.randomNum = function(min, max, beInteger) {
        min = min || 0;
        max = max || 99999999;
        beInteger = beInteger !== undefined ? beInteger : true; 
        if(min > max) {
            var temp = min;
            min = max;
            max = temp;
        }
        var result = min + (max - min) * random();
        if(beInteger){
            result = Math.floor(result);
        }
        return result;

    };
    
    function makeOneRandomAlpha (type){
        var alphas;
        switch (type) {
            case TYPE_LOWER_ALPHA_ONLY : 
                alphas = LOWER_ALPHA;
                break;
            case TYPE_UPPER_ALPHA_ONLY : 
                alphas = UPPERCASE_ALPHA;
                break;
            case TYPE_ALL_ALPHA : 
                alphas = ALL_ALPHA;
                break;
            default :
                alphas = LOWER_ALPHA;
        }
        return tool.randomItemInArr(alphas.split(''));
    }

    

    function isArray (arr) {
        return Object.toString.call(arr) === '[object Array]';
    }
})(window);