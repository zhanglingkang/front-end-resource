chai.Should();
var tool = window.tool;
var isAlpha = function(str) {
    return /^[a-zA-Z]+$/g.test(str);
};
var isUpperAlpha = function(str) {
    return /^[A-Z]+$/g.test(str);
};
var isLowerAlpha = function(str) {
    return /^[a-z]+$/g.test(str);
};
var isInt = function(str) {
    return /^\d+$/g.test(str); 
};
describe('random', function() {
    describe('#makeRandomAlpha', function() {
        it('should equal to the given cases default lowerCase', function() {
            for (var i = 0; i < 10; i++) {
                isLowerAlpha(tool.makeRandomAlpha()).should.be.true;
            }
            for (i = 0; i < 10; i++) {
                isUpperAlpha(
                    tool.makeRandomAlpha(1, {
                        allowUpperCase: true
                    })
                ).should.be.true;
            }
            for (i = 0; i < 10; i++) {
                isAlpha(
                    tool.makeRandomAlpha(1, {
                        allowAll: true
                    })
                ).should.be.true;
            }

        });

        it('should be equal to the given length default 1', function() {
            // use split because Ie6 not support String.prototype.length。
            // 但悲催的是，Ie6不支持chai
            tool.makeRandomAlpha().split('').length.should.equal(1); 
            tool.makeRandomAlpha(-1).split('').length.should.equal(1);
            tool.makeRandomAlpha(0).split('').length.should.equal(1);
            tool.makeRandomAlpha(10).split('').length.should.equal(10);
        });
    });

    describe('#randomItemInArr', function(){
        var sandbox;
        beforeEach(function() {
            //mock 
            sandbox = sinon.sandbox.create();
            sandbox.stub(window.console, "error");
        });

        afterEach(function() {
            sandbox.restore();
        });

        it('should in given array', function(){
            var arr = [1,2,3,4];
            for(var i = 0; i < 10; i++) {
                arr.indexOf(tool.randomItemInArr(arr)).should.greaterThan(-1);
            }
        });

        it('should throw a error if param is not array', function(){
            var obj = {};
            tool.randomItemInArr.bind(obj).should.throw();
            sinon.assert.calledOnce(console.error);
        });

    });

    describe('#randomNum', function(){
        it('should be in the expected range', function(){
            for(var i= 0; i < 10; i++) {
                tool.randomNum().should.greaterThan(-1);
            }
            for(i= 0; i < 10; i++) {
                tool.randomNum(5,100).should.greaterThan(4).lessThan(100);
            }
        });

        it('should be a integer default integer', function(){
            for(var i= 0; i < 10; i++) {
                isInt(tool.randomNum(0, 100)).should.be.true;
            } 
            for(i= 0; i < 10; i++) {
                isInt(tool.randomNum(0, 100, true)).should.be.true;
            } 
        });

        it('should be a float number', function(){
            for(var i= 0; i < 10; i++) {
                isInt(tool.randomNum(0, 100, false)).should.be.false;
            } 
        });
    });
});