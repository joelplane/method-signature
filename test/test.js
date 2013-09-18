/*
 * Usage: node test.js
 */

var assert = require('assert');
var helper = require('./helper');
var sig = require('../lib/method_signature');

// test this call signature:
//   sig(methodName, paramTypes, returnType)
(function(){
  var SomeClass = (function(){
  var s = SomeClass, p = s.prototype;

    function SomeClass() {
    }

    sig('testMethod1', ['number'], 'number');
    p.testMethod1 = function(num) {
      return 123;
    };

    sig('testMethod2', ['string'], 'string');
    p.testMethod2 = function(str) {
      return "123";
    };

    sig('testMethod3', [], 'string');
    p.testMethod3 = function(value) {
      return value;
    };

    sig.enforce(p);

    return s;
  })();

  var inst = new SomeClass();

  // tests for when we should not throw errors

  inst.testMethod1(123);
  inst.testMethod2('123');
  inst.testMethod3('123');

  // tests for when we *should* throw errors

  helper.expectError(/Expected 1st argument .* to be a number/, function(){
    inst.testMethod1('123');
  });

  helper.expectError(/Expected 1st argument .* to be a string/, function(){
    inst.testMethod2(123);
  });

  helper.expectError(/Expected return value .* to be a string/, function(){
    inst.testMethod3(123);
  });
})();

// test this call signature:
//   sig(subject, methodName, paramTypes, returnType)
(function(){
  var SomeClass = (function(){
  var s = SomeClass, p = s.prototype;

    function SomeClass() {
    }

    sig(p, 'testMethod1', ['number'], 'number');
    p.testMethod1 = function(num) {
      return 123;
    };

    sig(p, 'testMethod2', ['string'], 'string');
    p.testMethod2 = function(str) {
      return "123";
    };

    sig(p, 'testMethod3', [], 'string');
    p.testMethod3 = function(value) {
      return value;
    };

    sig.enforce();

    return s;
  })();

  var inst = new SomeClass();

  // tests for when we should not throw errors

  inst.testMethod1(123);
  inst.testMethod2('123');
  inst.testMethod3('123');

  // tests for when we *should* throw errors

  helper.expectError(/Expected 1st argument .* to be a number/, function(){
    inst.testMethod1('123');
  });

  helper.expectError(/Expected 1st argument .* to be a string/, function(){
    inst.testMethod2(123);
  });

  helper.expectError(/Expected return value .* to be a string/, function(){
    inst.testMethod3(123);
  });

})();
