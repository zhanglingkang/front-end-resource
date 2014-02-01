chai.Should();
var tool = window.tool;
var isAlpha = function(str) {
    return /^[a-zA-Z]+$/g.test(str);
}
var isUpperAlpha = function(str) {
    return /^[A-Z]+$/g.test(str);
}
var isLowerAlpha = function(str) {
    return /^[a-z]+$/g.test(str);
}
var isInt = function(str) {
   return /^\d+$/g.test(str); 
}
describe('random', function() {
    describe('#makeRandomAlpha', function() {
        it('alpha different cases', function() {
            for (var i = 0; i < 10; i++) {
                isLowerAlpha(tool.makeRandomAlpha()).should.be.true;
            }
            for (var i = 0; i < 10; i++) {
                isUpperAlpha(
                    tool.makeRandomAlpha(1, {
                        allowUpperCase: true
                    })
                ).should.be.true;
            }
            for (var i = 0; i < 10; i++) {
                isAlpha(
                    tool.makeRandomAlpha(1, {
                        allowAll: true
                    })
                ).should.be.true;
            }

        });

        it('alpha length', function() {
            tool.makeRandomAlpha().split('').length.should.equal(1); // use split because Ie6 not support String.prototype.length
            tool.makeRandomAlpha(-1).split('').length.should.equal(1);
            tool.makeRandomAlpha(0).split('').length.should.equal(1);
            tool.makeRandomAlpha(10).split('').length.should.equal(10);
        });
    });

    describe('#randomItemInArr', function(){
        it('item in arr', function(){
            var arr = [1,2,3,4];
            for(var i = 0; i < 10; i++) {
                arr.indexOf(tool.randomItemInArr(arr)).should.greaterThan(-1);
            }
        });

        it('param error', function(){
            var obj = {};
            tool.randomItemInArr.bind(obj).should.throw();
        });

    });

    describe('#randomNum', function(){
        it('number range', function(){
            for(var i= 0; i < 10; i++) {
                tool.randomNum().should.greaterThan(-1);
            }
            for(var i= 0; i < 10; i++) {
                tool.randomNum(5,100).should.greaterThan(4).lessThan(100);
            }
        });

        it('random integer', function(){
           for(var i= 0; i < 10; i++) {
                isInt(tool.randomNum(0, 100)).should.be.true;
            } 
        });
        it('random float', function(){
           for(var i= 0; i < 10; i++) {
                isInt(tool.randomNum(0, 100, false)).should.be.false;
            } 
        });
    });
});