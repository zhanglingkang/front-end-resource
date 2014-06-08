chai.Should();

describe('#validParam', function() {
    var valid = validParam;
    var undef = undefined;
    describe('test single type', function() {
        it('not undefined should return true,else should return errMsg when valid required', function() {
            valid({
                value: 'not undefined',
                valid: 'required'
            }).should.be.true;

            valid({
                value: undef,
                valid: 'required'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });


        it('obj should return true,else should return errMsg  when valid object', function() {
            valid({
                value: {},
                valid: 'obj'
            }).should.be.true;

            valid({
                value: '',
                valid: 'obj'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });

        it('number should return true,else should return errMsg  when valid number', function() {
            valid({
                value: 1.67,
                valid: 'num'
            }).should.be.true;

            valid({
                value: 2,
                valid: 'num'
            }).should.be.true;

            valid({
                value: '',
                valid: 'num'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });


        it('integer should return true,else should return errMsg  when valid integer', function() {
            valid({
                value: 23,
                valid: 'int'
            }).should.be.true;

            valid({
                value: '',
                valid: 'int'
            }).should.be.instanceof(Array).and.have.lengthOf(1);

            valid({
                value: 3.5,
                valid: 'int'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });

        it('boolean should return true,else should return errMsg  when valid boolean', function() {
            valid({
                value: true,
                valid: 'bool'
            }).should.be.true;

            valid({
                value: false,
                valid: 'bool'
            }).should.be.true;

            valid({
                value: '',
                valid: 'bool'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });

        it('string should return true,else should return errMsg  when valid string', function() {
            valid({
                value: '',
                valid: 'string'
            }).should.be.true;

            valid({
                value: 12,
                valid: 'string'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });

        it('array should return true,else should return errMsg  when valid array', function() {
            valid({
                value: [],
                valid: 'array'
            }).should.be.true;

            valid({
                value: '',
                valid: 'array'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });

        it('function should return true,else should return errMsg  when valid function', function() {
            valid({
                value: function() {},
                valid: 'function'
            }).should.be.true;

            valid({
                value: '',
                valid: 'function'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });

        it('user defined valid should return the valid function returned  when valid user defined valid', function() {
            function largerThan3(num){
                return num > 3;
            }
            valid({
                value: 5,
                valid: largerThan3
            }).should.be.true;

            valid({
                value: 1,
                valid: largerThan3
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });

    });

    describe('test multi', function() {
        it('should valid multi type', function() {
            valid({
                value: {},
                valid: ['required', 'obj']
            }).should.be.true;

            valid({
                value: {},
                valid: ['required', 'int']
            }).should.be.instanceof(Array).and.have.lengthOf(1);

            valid({
                value: undefined,
                valid: ['required', 'int']
            }).should.be.instanceof(Array).and.have.lengthOf(2);
        });

        it('should valid multi field', function() {
            valid([{
                value: {},
                valid: ['required']
            }, {
                value: 34,
                valid: ['int']
            }]).should.be.true;

            valid([{
                value: {},
                valid: ['required', 'int']
            }, {
                value: 34,
                valid: ['string']
            }]).should.be.instanceof(Array).and.have.lengthOf(2);

        });
    });

    describe('invalid', function() {
        it('should return err msg if not support type', function() {
            valid({
                value: undef,
                valid: 'not undefined'
            }).should.be.instanceof(Array).and.have.lengthOf(1);
        });
    });



});
