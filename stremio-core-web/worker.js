"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var Bridge = require('./bridge');
var bridge = new Bridge(self, self);
self.init = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(_ref) {
    var apiEndpoint, appVersion, shellVersion, _require, initialize_api, initialize_runtime, get_state, get_debug_state, dispatch, analytics, decode_stream;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          apiEndpoint = _ref.apiEndpoint, appVersion = _ref.appVersion, shellVersion = _ref.shellVersion;
          // TODO remove the document shim when this PR is merged
          // https://github.com/cfware/babel-plugin-bundled-import-meta/pull/26
          self.document = {
            baseURI: self.location.href
          };
          self.app_version = appVersion;
          self.shell_version = shellVersion;
          self.api_endpoint = apiEndpoint;
          self.get_location_hash = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
            return _regenerator["default"].wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", bridge.call(['location', 'hash'], []));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          self.local_storage_get_item = /*#__PURE__*/function () {
            var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(key) {
              return _regenerator["default"].wrap(function _callee2$(_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    return _context2.abrupt("return", bridge.call(['localStorage', 'getItem'], [key]));
                  case 1:
                  case "end":
                    return _context2.stop();
                }
              }, _callee2);
            }));
            return function (_x2) {
              return _ref4.apply(this, arguments);
            };
          }();
          self.local_storage_set_item = /*#__PURE__*/function () {
            var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(key, value) {
              return _regenerator["default"].wrap(function _callee3$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    return _context3.abrupt("return", bridge.call(['localStorage', 'setItem'], [key, value]));
                  case 1:
                  case "end":
                    return _context3.stop();
                }
              }, _callee3);
            }));
            return function (_x3, _x4) {
              return _ref5.apply(this, arguments);
            };
          }();
          self.local_storage_remove_item = /*#__PURE__*/function () {
            var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(key) {
              return _regenerator["default"].wrap(function _callee4$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    return _context4.abrupt("return", bridge.call(['localStorage', 'removeItem'], [key]));
                  case 1:
                  case "end":
                    return _context4.stop();
                }
              }, _callee4);
            }));
            return function (_x5) {
              return _ref6.apply(this, arguments);
            };
          }();
          _require = require('./stremio_core_web.js'), initialize_api = _require["default"], initialize_runtime = _require.initialize_runtime, get_state = _require.get_state, get_debug_state = _require.get_debug_state, dispatch = _require.dispatch, analytics = _require.analytics, decode_stream = _require.decode_stream;
          self.getState = get_state;
          self.getDebugState = get_debug_state;
          self.dispatch = dispatch;
          self.analytics = analytics;
          self.decodeStream = decode_stream;
          _context5.next = 17;
          return initialize_api(require('./stremio_core_web_bg.wasm'));
        case 17:
          _context5.next = 19;
          return initialize_runtime(function (event) {
            return bridge.call(['onCoreEvent'], [event]);
          });
        case 19:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();
