(function  (ctx) {
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
    ctx.makeRandomAlpha = function(alphaNum, option) {
        alphaNum = isNaN(alphaNum) ? 1 : parseInt(alphaNum);
        alphaNum = alphaNum <= 0 ? 1 : alphaNum;
        var type = TYPE_LOWER_ALPHA_ONLY;
        option = option || {};
        option.allowUpperCase && (type = TYPE_UPPER_ALPHA_ONLY);
        option.allowAll && (type = TYPE_ALL_ALPHA);
        var strArr = [];
        for(var i = 0; i < alphaNum; i++) {
            strArr.push(makeOneRandomAlpha(type));
        }
        return strArr.join('');

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
        return ctx.randomItemInArr(alphas.split(''));
    };

    ctx.randomItemInArr = function(arr){
        if(!isArray(arr)) {
            console.error('param@arr: %s shoule be array',arr);
            throw new Error('param@arr shoule be array');
        }
        var len = arr.length;
        var randomIndex = parseInt(len * random(), 10);
        return arr[randomIndex];
    };

    function isArray (arr) {
        return toString.call(arr) === '[object Array]';
    };
})(window);