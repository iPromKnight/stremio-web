"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function getId() {
  return Math.random().toString(32).slice(2);
}
function Bridge(scope, handler) {
  handler.addEventListener('message', /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref) {
      var request, id, path, args, value, data, thisArg;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            request = _ref.data.request;
            if (request) {
              _context.next = 3;
              break;
            }
            return _context.abrupt("return");
          case 3:
            id = request.id, path = request.path, args = request.args;
            _context.prev = 4;
            value = path.reduce(function (value, prop) {
              return value[prop];
            }, scope);
            if (!(typeof value === 'function')) {
              _context.next = 13;
              break;
            }
            thisArg = path.slice(0, path.length - 1).reduce(function (value, prop) {
              return value[prop];
            }, scope);
            _context.next = 10;
            return value.apply(thisArg, args);
          case 10:
            data = _context.sent;
            _context.next = 16;
            break;
          case 13:
            _context.next = 15;
            return value;
          case 15:
            data = _context.sent;
          case 16:
            handler.postMessage({
              response: {
                id: id,
                result: {
                  data: data
                }
              }
            });
            _context.next = 22;
            break;
          case 19:
            _context.prev = 19;
            _context.t0 = _context["catch"](4);
            handler.postMessage({
              response: {
                id: id,
                result: {
                  error: _context.t0
                }
              }
            });
          case 22:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[4, 19]]);
    }));
    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }());
  this.call = /*#__PURE__*/function () {
    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(path, args) {
      var id;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            id = getId();
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              var onMessage = function onMessage(_ref4) {
                var response = _ref4.data.response;
                if (!response || response.id !== id) return;
                handler.removeEventListener('message', onMessage);
                if ('error' in response.result) {
                  reject(response.result.error);
                } else {
                  resolve(response.result.data);
                }
              };
              handler.addEventListener('message', onMessage);
              handler.postMessage({
                request: {
                  id: id,
                  path: path,
                  args: args
                }
              });
            }));
          case 2:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x2, _x3) {
      return _ref3.apply(this, arguments);
    };
  }();
}
module.exports = Bridge;
