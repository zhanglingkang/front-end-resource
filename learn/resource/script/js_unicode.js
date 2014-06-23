/*
*js Unicode编码转换
*/
var decToHex = function(str) {
    var res=[];
    for(var i=0;i < str.length;i++)
        res[i]=("00"+str.charCodeAt(i).toString(16)).slice(-4);
    return "\\u"+res.join("\\u");
}
var hexToDec = function(str) {
    str=str.replace(/\\/g,"%");
    return unescape(str);
}
/*
* 混淆代码
* hexToDec(hexToDec(decToHex(decToHex('alert')))) -> alert
* decToHex('alert') -> '\u0061\u006c\u0065\u0072\u0074'
* window["\u0061\u006c\u0065\u0072\u0074"](1) -> alert(1)
*
*
* var a = {}
* decToHex('b') -> "\u0062"
* a['\u0062']='123' -> a:{b:1}
*/