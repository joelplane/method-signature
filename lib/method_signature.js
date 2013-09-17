(function (define) {
  define(function(){

    var rules = [
      [/.*/, function(typeString, value){
        return (typeof value == typeString) ||
               (value && value.constructor && (value.constructor.name == typeString));
      }]
    ];

    /**
     * @param {string} typeString
     * @returns {Function|null}
     */
    var findMatchingRule = function(typeString) {
      var foundFunction = null;
      rules.forEach(function(rule){
        var regex = rule[0];
        var func = rule[1];
        if (!foundFunction && regex.test(typeString)) {
          foundFunction = func;
        }
      });
      return foundFunction;
    };

    function sig(methodName, paramTypes, returnType) {
      sig.methodSignatures = sig.methodSignatures || [];
      var sigHash = {
        methodName: methodName,
        paramTypes: paramTypes,
        returnType: returnType
      };
      sig.methodSignatures.push(sigHash);
    }

    var CHECK_TYPE_PARAM = 0;
    var CHECK_TYPE_RETURN_VALUE = 1;

    var ords = ['1st', '2nd', '3rd'];

    var check = function(expectedType, actualValue, methodName, checkType, index) {
      var checkFunction = findMatchingRule(expectedType);
      if (!checkFunction(expectedType, actualValue)) {
        var actualValueString = actualValue['inspect'] ? actualValue.inspect() : actualValue.toString();
        var what = checkType == CHECK_TYPE_RETURN_VALUE ? 'return value' : null;
        if (!what) {
          var ord = ords[index] || ((index + 1) + "th");
          what = ord + " argument";
        }
        var valueTypeHint;
        if (actualValue && actualValue.constructor && actualValue.constructor.name) {
          valueTypeHint = actualValue.constructor.name
        } else {
          valueTypeHint = typeof actualValue;
        }
        var message = 'Expected ' + what + ' of ' + methodName + '() to be a ' + expectedType + ', but got ' + actualValueString + ' (' + valueTypeHint + ')';
        throw new Error('Type Error: ' + message);
      }
    };

    var checkParams = function(expectedTypes, actualValues, methodName) {
      for(var i=0; i<expectedTypes.length; i++) {
        check(expectedTypes[i], actualValues[i], methodName, CHECK_TYPE_PARAM, i);
      }
    };

    sig.enforce = function(proto) {
      (sig.methodSignatures || []).forEach(function(sigHash){
        var originalMethod = proto[sigHash.methodName];
        proto[sigHash.methodName] = function() {
          if (sigHash.paramTypes) {
            checkParams(sigHash.paramTypes, arguments, sigHash.methodName);
          }
          var returnValue = originalMethod.apply(this, arguments);
          if (typeof sigHash.returnType == 'string') {
            check(sigHash.returnType, returnValue, sigHash.methodName, CHECK_TYPE_RETURN_VALUE);
          }
          return returnValue;
        };
      });
      delete sig.methodSignatures;
    };

    return sig;
  });
}(typeof define === 'function' && define.amd ? define : function (definition) {
  if (module) {
    // nodejs
    module.exports = definition();
  } else {
    // non-amd web
    window.sig = definition();
  }
}));
