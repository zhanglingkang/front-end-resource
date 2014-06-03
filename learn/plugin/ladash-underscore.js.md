[lodash](http://lodash.com/)和[underscorejs](http://underscorejs.org/)都是js工具库。

区别
* lodash比underscorejs的性能好
* lodash能个性化构建：它能构建出underscorejs版（与underscorejs的api完全一致）,modern版，compat版，Legacy版，moblie版等
* lodash增加了一些underscore没有的api，如_.cloneDeep

总而言之，loadash比underscore更牛~

下面介绍下loash的一些常用的api

## 遍历
### 遍历数组
```
var arr = ['a', 'b'];
_.each(arr, function(each, index){
    console.log(each, index);
});
/* 
输出
 a 0
 b 1
*/
```
### 遍历对象
```
var obj = {
    'name' : 'joel'
    , 'sex' : 'male'
};
_.each(obj, function(value, key){
    console.log(value, key);
});
/* 
输出
 joel name
 male sex
*/ 
```

### map
### filter
### pluck

## 异步控制
### after




## 资源
* http://lodash.com/custom-builds
* https://github.com/lodash/lodash/wiki/build-differences
* 用grunt来自定义构建loadash https://github.com/lodash/grunt-lodash   