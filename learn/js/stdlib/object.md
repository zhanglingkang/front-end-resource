# Object
## 初始化
```
var o = {};
var o = new Object();
```

## 遍历对象
```
var obj = {
    name: 'joel',
    sex: 'male'
};
var value;
for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
        value = obj[key];
        // do other things
    }
}
```

## 更多
* http://javascript.ruanyifeng.com/stdlib/object.html