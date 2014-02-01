chai.Should();
var ctx = window;
var isAlpha = function(str) {
    return /^[a-zA-Z]+$/g.test(str);
}
var isUpperAlpha = function(str) {
    return /^[A-Z]+$/g.test(str);
}
var isLowerAlpha = function(str) {
    return /^[a-z]+$/g.test(str);
}
describe('random', function() {
    describe('#makeRandomAlpha', function() {
        it('alpha different cases', function() {
            for (var i = 0; i < 10; i++) {
                isLowerAlpha(ctx.makeRandomAlpha()).should.be.true;
            }
            for (var i = 0; i < 10; i++) {
                isUpperAlpha(
                    ctx.makeRandomAlpha(1, {
                        allowUpperCase: true
                    })
                ).should.be.true;
            }
            for (var i = 0; i < 10; i++) {
                isAlpha(
                    ctx.makeRandomAlpha(1, {
                        allowAll: true
                    })
                ).should.be.true;
            }

        });

        it('alpha length', function() {
            ctx.makeRandomAlpha().split('').length.should.equal(1); // use split because Ie6 not support String.prototype.length
            ctx.makeRandomAlpha(-1).split('').length.should.equal(1);
            ctx.makeRandomAlpha(0).split('').length.should.equal(1);
            ctx.makeRandomAlpha(10).split('').length.should.equal(10);
        });
    });

    describe('#randomItemInArr',function(){
        it('item in arr', function(){
            var arr = [1,2,3,4];
            for(var i = 0; i < 10; i++) {
                arr.indexOf(ctx.randomItemInArr(arr)).should.greaterThan(-1);
            }
        });

        it('param error', function(){
            var obj = {};
            ctx.randomItemInArr.bind(obj).should.throw();
        });

    });
});