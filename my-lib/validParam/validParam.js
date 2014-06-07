/**
validParam
v0.0.1
depend on lodash

*/

(function(win) {
    var validType = [
        'required',
        'object', 'obj',
        'number', 'num',
        'int',
        'bool',
        'string',
        'array', 'arr',
        'function', 'fun'
    ];

    function valid(validArr) {
        var errMsgArr = [];
        if (!_.isArray(validArr)) {
            validArr = [validArr];
        }
        _.forEach(validArr, function(each, index) {
            if (each && each.valid !== undefined) {
                if (!_.isArray(each.valid)) {
                    each.valid = [each.valid];
                }
                _.forEach(each.valid, function(eachValid) {
                    var validMsg = validEach(each.value, eachValid);
                    if (validMsg !== true) {
                        errMsgArr.push('index ' + index + ': ' + validMsg);
                    }
                });
            } else {
                errMsgArr.push('index ' + index + ': invalid format!');
            }

        });
        if (errMsgArr.length === 0) {
            return true;
        } else {
            return errMsgArr;
        }
    }

    function validEach(value, type) {
        var validMsg;
        var ERROR_MSG_PREFIX = 'should be ';
        if (_.isString(type)) {
            if (_.indexOf(validType, type) === -1) {
                validMsg = 'unknown validType:' + type;
            }
            switch (type) {
                case 'required':
                    validMsg = value !== undefined ? true : ERROR_MSG_PREFIX + 'not undefined';
                    break;
                case 'object':
                case 'obj':
                    validMsg = _.isObject(value) ? true : ERROR_MSG_PREFIX + 'object';
                    break;
                case 'number':
                case 'num':
                    validMsg = _.isNumber(value) ? true : ERROR_MSG_PREFIX + 'number';
                    break;
                case 'bool':
                    validMsg = _.isBoolean(value) ? true : ERROR_MSG_PREFIX + 'bool';
                    break;
                case 'string':
                    validMsg = _.isString(value) ? true : ERROR_MSG_PREFIX + 'string';
                    break;
                case 'array':
                case 'arr':
                    validMsg = _.isArray(value) ? true : ERROR_MSG_PREFIX + 'array';
                    break;
                case 'function':
                case 'fun':
                    validMsg = _.isFunction(value) ? true : ERROR_MSG_PREFIX + 'function';
                    break;
            }
        } else if (_.isFunction(type)) { // 自定义验证函数
            validMsg = type(value) ? true : 'custom valid fail';
        } else {
            validMsg = 'unknown validType:' + type;
        }
        return validMsg;
    }

    win.validParam = valid;
})(this);
