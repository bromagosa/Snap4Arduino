// tiny util.inherits shim.

util = {};

util.inherits = function (Class, Parent) {
  Class.prototype.__proto__ = Parent.prototype;
};
  
