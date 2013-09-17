(function (define) {
  define(function(){

    if (!'forEach' in []) {
      throw new Error("method-signature expects a forEach method on Array");
    }

    var CHECK_TYPE_PARAM = 0;
    var CHECK_TYPE_RETURN_VALUE = 1;

    var rules = [
      {
        test: /.*/,
        valueCheck: function(typeString, value){
          return (typeof value == typeString) ||
                 (value && value.constructor && (value.constructor.name == typeString));
        }
      }
    ];

    /**
     * @param {Function|RegExp|string} ruleTest
     * @returns {Function}
     */
    var ruleTestToFunction = function(ruleTest) {
      if (typeof ruleTest == 'function') {
        return ruleTest;
      } else if (ruleTest instanceof RegExp) {
        return function(value) {
          return ruleTest.test(value);
        };
      } else {
        return function(typeString) {
          return ruleTest == typeString;
        }
      }
    };

    /**
     * @param {string} typeString
     * @returns {Function|null}
     */
    var findMatchingRule = function(typeString) {
      var foundFunction = null;
      rules.forEach(function(rule){
        var typeTestFunction = ruleTestToFunction(rule.test);
        var func = rule.valueCheck;
        if (!foundFunction && typeTestFunction(typeString)) {
          foundFunction = func;
        }
      });
      return foundFunction;
    };

    /**
     * @public
     * @param {string} methodName
     * @param {string[]} paramTypes
     * @param {string} returnType
     */
    function sig(methodName, paramTypes, returnType) {
      sig.methodSignatures = sig.methodSignatures || [];
      var sigHash = {
        methodName: methodName,
        paramTypes: paramTypes,
        returnType: returnType
      };
      sig.methodSignatures.push(sigHash);
    }

    /**
     * @param {number} index
     * @returns {string}
     */
    var ordFromIndex = (function(){
      var ords = ['1st', '2nd', '3rd'];
      return function(index) {
        return ords[index] || ((index + 1) + "th");
      };
    })();

    /**
     * @param {string} expectedType
     * @param {object} actualValue
     * @param {string} methodName
     * @param {number} checkType
     * @param {number} index
     */
    var check = function(expectedType, actualValue, methodName, checkType, index) {
      var checkFunction = findMatchingRule(expectedType);
      if (!checkFunction(expectedType, actualValue)) {
        var actualValueString = actualValue['inspect'] ? actualValue.inspect() : actualValue.toString();
        var what = checkType == CHECK_TYPE_RETURN_VALUE ? 'return value' : null;
        if (!what) {
          what = ordFromIndex(index) + " argument";
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

    /**
     * @param {string[]} expectedTypes
     * @param {object[]} actualValues
     * @param {string} methodName
     */
    var checkParams = function(expectedTypes, actualValues, methodName) {
      for(var i=0; i<expectedTypes.length; i++) {
        check(expectedTypes[i], actualValues[i], methodName, CHECK_TYPE_PARAM, i);
      }
    };

    /**
     * Wrap each method with type checking.
     * @public
     * @param {object} proto Object on which the subject methods are defined
     */
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
    // for node.js
    module.exports = definition();
  } else {
    // for the big bad non-AMD web
    window.sig = definition();
  }
}));
