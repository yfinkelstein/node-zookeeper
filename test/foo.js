#!/usr/bin/env node

var util = require('util');
var _ = require('underscore');

function MyFunctionalShape() {
  if(! this instanceof MyFunctionalShape) {
    return new MyFunctionalShape();
  }
  var self = this;
  console.log('parent ctor: this=' + this);
}

MyFunctionalShape.prototype.baseMethod = function() { }

function MyFunctionalCircle() {
  if(!_.isObject(this) || !(this instanceof MyFunctionalCircle)) {
    return new MyFunctionalCircle(arguments);
  }
  var self = this;
  MyFunctionalShape.apply(self);
  
  self.fn = function() { }  
  console.log('child ctor: this=' + this);
}

MyFunctionalCircle.super_ = MyFunctionalShape;
MyFunctionalCircle.prototype = Object.create(MyFunctionalShape.prototype, {
  constructor: {
    value: MyFunctionalCircle,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

MyFunctionalCircle.prototype.method = function() {
console.log("a: " + util.inspect(this, true, 99));
  
};

MyFunctionalShape.prototype.baseMethod2 = function() {};

function lookAt(obj, name) {
  console.log("Looking at " + name + ":");
  for(key in obj) {
    console.log(name + "['" + key + "'] = " + obj[key]);
  }
}


var a = new MyFunctionalCircle();
lookAt(a, 'a');
console.log("a: " + util.inspect(a, true, 99));
a.method();
