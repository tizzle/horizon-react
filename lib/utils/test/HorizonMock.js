'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var horizonSub = function horizonSub(data) {
  return {
    watch: function watch() {
      return {
        forEach: function forEach(fn) {
          fn(data);
        }
      };
    }
  };
};

function HorizonMock() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var hzInterface = function hzInterface() {
    return _extends({
      findAll: function findAll() {},

      _query: Math.random()
    }, horizonSub(opts.data));
  };

  hzInterface.status = opts.status ? opts.status : function () {
    return {
      getValue: function getValue() {
        return { type: 'ready' };
      }
    };
  };
  hzInterface.connect = function () {};
  hzInterface.onReady = function () {};
  hzInterface.onDisconnected = function () {};
  hzInterface.onSocketError = function () {};

  return hzInterface;
}

exports["default"] = HorizonMock;
exports.horizonSub = horizonSub;