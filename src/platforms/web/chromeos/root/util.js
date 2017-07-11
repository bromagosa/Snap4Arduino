// tiny util.inherits shim.
exports.inherits = function (Class, Parent) {
  Class.prototype.__proto__ = Parent.prototype;
};
  