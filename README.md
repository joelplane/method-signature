method-signature
================

A clean-ish way to add run-time type assertions to methods in Javascript.

The types of a method's __arguments__ and __return values__ can be declared.
They will be checked when the method is called, and an error will be thrown if
the wrong type is passed in or returned.

Example Usage
-------------

Simple example - we declare a method named methodName that takes two number
arguments and returns a string.

We use the sig() method to declare the types. The first argument is the name of
the method. The next is an array of strings representing the types of the
method's arguments. The final argument to sig() is the type of the return
value.

```javascript
sig('methodName', ['number', 'number'], 'string');
obj.methodName = function() {
  // actual method definition here
}

// After one or many calls to sig() as above, you must call enforce() to
// decorate all the methods with the type checking logic:
sig.enforce(obj);
```

The type strings (like 'number' and 'string' above) can be the names of
primitive javascript types (object, number, string, boolean) or class names
(the result of calling value.constructor.name).

A more complete example should make it clearer (maybe..). This is how I tend to
define classes in Javascript. I'm using AMD here - but that's not required.

```javascript
define(['method-signature'], function(sig) {

  var s = SillyAdder, p = s.prototype;

  function SillyAdder(num) {
    this.num = num;
  }

  sig('add', ['number'], 'number');
  p.add = function(anotherNum) {
    return this.num + anotherNum;
  };

  sig('subtract', ['number'], 'number');
  p.subtract = function(anotherNum) {
    return this.num - anotherNum;
  };

  sig.enforce(p);

  return s;
});
```

If we then attempt to call one of these methods with a wrong type, we'll get an
error:

```javascript
var adder = new SillyAdder(4);
adder.add(38)    // => returns 42 - works fine
adder.add('38'); // => throws an error with this message:
// Type Error: Expected 1st argument of add() to be a number, but got 38 (string)
```

Alterative and more flexible call signature:

```javascript
define(['method-signature'], function(sig) {

  var s = SillyAdder, p = s.prototype;

  function SillyAdder(num) {
    sig.check(['number'], arguments);
    this.num = num;
  }

  sig(p, 'add', ['number'], 'number'); // passing prototype as first param
  p.add = function(anotherNum) {
    return this.num + anotherNum;
  };

  sig(p, 'subtract', ['number'], 'number');
  p.subtract = function(anotherNum) {
    return this.num - anotherNum;
  };

  sig.enforce(); // no need to pass the prototype here

  return s;
});
```
