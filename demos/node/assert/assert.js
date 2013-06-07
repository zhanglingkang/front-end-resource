var assert = require("assert");
assert.equal(1,true,"test1");
assert.ok(1,"1 is true");
assert.ok(0,"0 is false");//不通过测试  会抛错
//assert.deepEqual(actual, expected, message);
// assert.notDeepEqual(actual, expected, message);