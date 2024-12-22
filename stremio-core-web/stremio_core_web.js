"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.analytics = analytics;
exports.decode_stream = decode_stream;
exports["default"] = void 0;
exports.dispatch = dispatch;
exports.get_state = get_state;
exports.initialize_runtime = initialize_runtime;
exports.start = start;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var importMeta = {
  url: new URL('/stremio_core_web.js', document.baseURI).href
};
var wasm;
var heap = new Array(32).fill(undefined);
heap.push(undefined, null, true, false);
function getObject(idx) {
  return heap[idx];
}
var WASM_VECTOR_LEN = 0;
var cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}
var cachedTextEncoder = new TextEncoder('utf-8');
var encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function (arg, view) {
  var buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    var buf = cachedTextEncoder.encode(arg);
    var _ptr = malloc(buf.length);
    getUint8Memory0().subarray(_ptr, _ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return _ptr;
  }
  var len = arg.length;
  var ptr = malloc(len);
  var mem = getUint8Memory0();
  var offset = 0;
  for (; offset < len; offset++) {
    var code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3);
    var view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    var ret = encodeString(arg, view);
    offset += ret.written;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function isLikeNone(x) {
  return x === undefined || x === null;
}
var cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}
var heap_next = heap.length;
function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}
function takeObject(idx) {
  var ret = getObject(idx);
  dropObject(idx);
  return ret;
}
var cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
cachedTextDecoder.decode();
function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  var idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
function debugString(val) {
  // primitive types
  var type = (0, _typeof2["default"])(val);
  if (type == 'number' || type == 'boolean' || val == null) {
    return "".concat(val);
  }
  if (type == 'string') {
    return "\"".concat(val, "\"");
  }
  if (type == 'symbol') {
    var description = val.description;
    if (description == null) {
      return 'Symbol';
    } else {
      return "Symbol(".concat(description, ")");
    }
  }
  if (type == 'function') {
    var name = val.name;
    if (typeof name == 'string' && name.length > 0) {
      return "Function(".concat(name, ")");
    } else {
      return 'Function';
    }
  }
  // objects
  if (Array.isArray(val)) {
    var length = val.length;
    var debug = '[';
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (var i = 1; i < length; i++) {
      debug += ', ' + debugString(val[i]);
    }
    debug += ']';
    return debug;
  }
  // Test for built-in
  var builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  var className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == 'Object') {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return 'Object(' + JSON.stringify(val) + ')';
    } catch (_) {
      return 'Object';
    }
  }
  // errors
  if (val instanceof Error) {
    return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}
function makeMutClosure(arg0, arg1, dtor, f) {
  var state = {
    a: arg0,
    b: arg1,
    cnt: 1,
    dtor: dtor
  };
  var real = function real() {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    var a = state.a;
    state.a = 0;
    try {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return f.apply(void 0, [a, state.b].concat(args));
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;
  return real;
}
function __wbg_adapter_28(arg0, arg1) {
  wasm.wasm_bindgen__convert__closures__invoke0_mut__h22fa0de9dec093c8(arg0, arg1);
}
function __wbg_adapter_31(arg0, arg1, arg2) {
  wasm.wasm_bindgen__convert__closures__invoke1_mut__ha5420bc52dc258f0(arg0, arg1, addHeapObject(arg2));
}

/**
*/
function start() {
  wasm.start();
}

/**
* @param {Function} emit_to_ui
* @returns {Promise<void>}
*/
function initialize_runtime(emit_to_ui) {
  var ret = wasm.initialize_runtime(addHeapObject(emit_to_ui));
  return takeObject(ret);
}

/**
* @param {any} field
* @returns {any}
*/
function get_state(field) {
  var ret = wasm.get_state(addHeapObject(field));
  return takeObject(ret);
}

/**
* @param {any} action
* @param {any} field
* @param {any} location_hash
*/
function dispatch(action, field, location_hash) {
  wasm.dispatch(addHeapObject(action), addHeapObject(field), addHeapObject(location_hash));
}

/**
* @param {any} event
* @param {any} location_hash
*/
function analytics(event, location_hash) {
  wasm.analytics(addHeapObject(event), addHeapObject(location_hash));
}

/**
* @param {any} stream
* @returns {any}
*/
function decode_stream(stream) {
  var ret = wasm.decode_stream(addHeapObject(stream));
  return takeObject(ret);
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
function __wbg_adapter_120(arg0, arg1, arg2, arg3) {
  wasm.wasm_bindgen__convert__closures__invoke2_mut__h169dda7fb06caafc(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}
function load(_x, _x2) {
  return _load.apply(this, arguments);
}
function _load() {
  _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(module, imports) {
    var bytes, instance;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!(typeof Response === 'function' && module instanceof Response)) {
            _context.next = 23;
            break;
          }
          if (!(typeof WebAssembly.instantiateStreaming === 'function')) {
            _context.next = 15;
            break;
          }
          _context.prev = 2;
          _context.next = 5;
          return WebAssembly.instantiateStreaming(module, imports);
        case 5:
          return _context.abrupt("return", _context.sent);
        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](2);
          if (!(module.headers.get('Content-Type') != 'application/wasm')) {
            _context.next = 14;
            break;
          }
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", _context.t0);
          _context.next = 15;
          break;
        case 14:
          throw _context.t0;
        case 15:
          _context.next = 17;
          return module.arrayBuffer();
        case 17:
          bytes = _context.sent;
          _context.next = 20;
          return WebAssembly.instantiate(bytes, imports);
        case 20:
          return _context.abrupt("return", _context.sent);
        case 23:
          _context.next = 25;
          return WebAssembly.instantiate(module, imports);
        case 25:
          instance = _context.sent;
          if (!(instance instanceof WebAssembly.Instance)) {
            _context.next = 30;
            break;
          }
          return _context.abrupt("return", {
            instance: instance,
            module: module
          });
        case 30:
          return _context.abrupt("return", instance);
        case 31:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[2, 8]]);
  }));
  return _load.apply(this, arguments);
}
function init(_x3) {
  return _init.apply(this, arguments);
}
function _init() {
  _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(input) {
    var imports, _yield$load, instance, module;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          if (typeof input === 'undefined') {
            input = new URL('stremio_core_web_bg.wasm', importMeta.url);
          }
          imports = {};
          imports.wbg = {};
          imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
            var obj = getObject(arg1);
            var ret = typeof obj === 'string' ? obj : undefined;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
            takeObject(arg0);
          };
          imports.wbg.__wbg_localstoragegetitem_6ba83b5ef9737523 = function () {
            return handleError(function (arg0, arg1) {
              try {
                var ret = self.local_storage_get_item(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
              }
            }, arguments);
          };
          imports.wbg.__wbg_getlocationhash_25eeb0e10871bbf1 = function () {
            return handleError(function () {
              var ret = self.get_location_hash();
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_localstorageremoveitem_931981e3cab0a9bf = function () {
            return handleError(function (arg0, arg1) {
              try {
                var ret = self.local_storage_remove_item(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
              }
            }, arguments);
          };
          imports.wbg.__wbg_localstoragesetitem_993f37d59d2bc4e5 = function () {
            return handleError(function (arg0, arg1, arg2, arg3) {
              try {
                var ret = self.local_storage_set_item(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
                return addHeapObject(ret);
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
                wasm.__wbindgen_free(arg2, arg3);
              }
            }, arguments);
          };
          imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
            var ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_static_accessor_APP_VERSION_ffeb1f3381665639 = function (arg0) {
            var ret = self.app_version;
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_static_accessor_SHELL_VERSION_74835a2388bfdfa7 = function (arg0) {
            var ret = self.shell_version;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_static_accessor_API_URL_5e37ef2149b89214 = function (arg0) {
            var ret = self.api_endpoint;
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_static_accessor_API_KEY_72250dddd8cc4164 = function (arg0) {
            var ret = self.api_key;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_is_undefined = function (arg0) {
            var ret = getObject(arg0) === undefined;
            return ret;
          };
          imports.wbg.__wbg_new_693216e109162396 = function () {
            var ret = new Error();
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function (arg0, arg1) {
            var ret = getObject(arg1).stack;
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_error_09919627ac0992f5 = function (arg0, arg1) {
            try {
              console.error(getStringFromWasm0(arg0, arg1));
            } finally {
              wasm.__wbindgen_free(arg0, arg1);
            }
          };
          imports.wbg.__wbg_crypto_1dc1c51d9d27e0dd = function (arg0) {
            var ret = getObject(arg0).crypto;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_is_object = function (arg0) {
            var val = getObject(arg0);
            var ret = (0, _typeof2["default"])(val) === 'object' && val !== null;
            return ret;
          };
          imports.wbg.__wbg_process_65edac0b2f0a8427 = function (arg0) {
            var ret = getObject(arg0).process;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_versions_0d0eed1c1b42b216 = function (arg0) {
            var ret = getObject(arg0).versions;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_node_82761bdd6eaac7e7 = function (arg0) {
            var ret = getObject(arg0).node;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_is_string = function (arg0) {
            var ret = typeof getObject(arg0) === 'string';
            return ret;
          };
          imports.wbg.__wbg_require_3f60396135018b0f = function () {
            return handleError(function () {
              var ret = module.require;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_msCrypto_4ef1b0e1cd4cedbb = function (arg0) {
            var ret = getObject(arg0).msCrypto;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_randomFillSync_d84d19ffc1d700ed = function () {
            return handleError(function (arg0, arg1) {
              getObject(arg0).randomFillSync(takeObject(arg1));
            }, arguments);
          };
          imports.wbg.__wbg_getRandomValues_3293819ebec805bc = function () {
            return handleError(function (arg0, arg1) {
              getObject(arg0).getRandomValues(getObject(arg1));
            }, arguments);
          };
          imports.wbg.__wbg_log_02e20a3c32305fb7 = function (arg0, arg1) {
            try {
              console.log(getStringFromWasm0(arg0, arg1));
            } finally {
              wasm.__wbindgen_free(arg0, arg1);
            }
          };
          imports.wbg.__wbg_log_5c7513aa8c164502 = function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            try {
              console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
            } finally {
              wasm.__wbindgen_free(arg0, arg1);
            }
          };
          imports.wbg.__wbg_mark_abc7631bdced64f0 = function (arg0, arg1) {
            performance.mark(getStringFromWasm0(arg0, arg1));
          };
          imports.wbg.__wbg_measure_c528ff64085b7146 = function () {
            return handleError(function (arg0, arg1, arg2, arg3) {
              try {
                performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
              } finally {
                wasm.__wbindgen_free(arg0, arg1);
                wasm.__wbindgen_free(arg2, arg3);
              }
            }, arguments);
          };
          imports.wbg.__wbindgen_cb_drop = function (arg0) {
            var obj = takeObject(arg0).original;
            if (obj.cnt-- == 1) {
              obj.a = 0;
              return true;
            }
            var ret = false;
            return ret;
          };
          imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
            var ret = getObject(arg0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_newwithstrandinit_9b0fa00478c37287 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_instanceof_Response_e1b11afbefa5b563 = function (arg0) {
            var ret = getObject(arg0) instanceof Response;
            return ret;
          };
          imports.wbg.__wbg_status_6d8bb444ddc5a7b2 = function (arg0) {
            var ret = getObject(arg0).status;
            return ret;
          };
          imports.wbg.__wbg_text_8279d34d73e43c68 = function () {
            return handleError(function (arg0) {
              var ret = getObject(arg0).text();
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_language_cd6e22892ba36a1f = function (arg0, arg1) {
            var ret = getObject(arg1).language;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_instanceof_WorkerGlobalScope_f191ca0158f5637b = function (arg0) {
            var ret = getObject(arg0) instanceof WorkerGlobalScope;
            return ret;
          };
          imports.wbg.__wbg_navigator_8bc0889cda8f8500 = function (arg0) {
            var ret = getObject(arg0).navigator;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_fetch_b4e81012e07ff95a = function (arg0, arg1) {
            var ret = getObject(arg0).fetch(getObject(arg1));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_setInterval_a02797f5ab1c7eb1 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = getObject(arg0).setInterval(getObject(arg1), arg2);
              return ret;
            }, arguments);
          };
          imports.wbg.__wbindgen_number_new = function (arg0) {
            var ret = arg0;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_is_function = function (arg0) {
            var ret = typeof getObject(arg0) === 'function';
            return ret;
          };
          imports.wbg.__wbg_newnoargs_be86524d73f67598 = function (arg0, arg1) {
            var ret = new Function(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_call_888d259a5fefc347 = function () {
            return handleError(function (arg0, arg1) {
              var ret = getObject(arg0).call(getObject(arg1));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_new_0b83d3df67ecb33e = function () {
            var ret = new Object();
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_self_c6fbdfc2918d5e58 = function () {
            return handleError(function () {
              var ret = self.self;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_window_baec038b5ab35c54 = function () {
            return handleError(function () {
              var ret = window.window;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_globalThis_3f735a5746d41fbd = function () {
            return handleError(function () {
              var ret = globalThis.globalThis;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_global_1bc0b39582740e95 = function () {
            return handleError(function () {
              var ret = global.global;
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_instanceof_Error_561efcb1265706d8 = function (arg0) {
            var ret = getObject(arg0) instanceof Error;
            return ret;
          };
          imports.wbg.__wbg_message_9f7d15ff97fc4102 = function (arg0) {
            var ret = getObject(arg0).message;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_call_346669c262382ad7 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_getTimezoneOffset_d3e5a22a1b7fb1d8 = function (arg0) {
            var ret = getObject(arg0).getTimezoneOffset();
            return ret;
          };
          imports.wbg.__wbg_new_f11872bb9bb9d781 = function (arg0) {
            var ret = new Date(getObject(arg0));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_now_af172eabe2e041ad = function () {
            var ret = Date.now();
            return ret;
          };
          imports.wbg.__wbg_new_b1d61b5687f5e73a = function (arg0, arg1) {
            try {
              var state0 = {
                a: arg0,
                b: arg1
              };
              var cb0 = function cb0(arg0, arg1) {
                var a = state0.a;
                state0.a = 0;
                try {
                  return __wbg_adapter_120(a, state0.b, arg0, arg1);
                } finally {
                  state0.a = a;
                }
              };
              var ret = new Promise(cb0);
              return addHeapObject(ret);
            } finally {
              state0.a = state0.b = 0;
            }
          };
          imports.wbg.__wbg_resolve_d23068002f584f22 = function (arg0) {
            var ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_then_2fcac196782070cc = function (arg0, arg1) {
            var ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_then_8c2d62e8ae5978f7 = function (arg0, arg1, arg2) {
            var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_buffer_397eaa4d72ee94dd = function (arg0) {
            var ret = getObject(arg0).buffer;
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_newwithbyteoffsetandlength_4b9b8c4e3f5adbff = function (arg0, arg1, arg2) {
            var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_new_a7ce447f15ff496f = function (arg0) {
            var ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_set_969ad0a60e51d320 = function (arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
          };
          imports.wbg.__wbg_newwithlength_929232475839a482 = function (arg0) {
            var ret = new Uint8Array(arg0 >>> 0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_subarray_8b658422a224f479 = function (arg0, arg1, arg2) {
            var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_set_82a4e8a85e31ac42 = function () {
            return handleError(function (arg0, arg1, arg2) {
              var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
              return ret;
            }, arguments);
          };
          imports.wbg.__wbg_parse_ccb2cd4fe8ead0cb = function () {
            return handleError(function (arg0, arg1) {
              var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbg_stringify_d4507a59932eed0c = function () {
            return handleError(function (arg0) {
              var ret = JSON.stringify(getObject(arg0));
              return addHeapObject(ret);
            }, arguments);
          };
          imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
            var ret = debugString(getObject(arg1));
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_throw = function (arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
          };
          imports.wbg.__wbindgen_memory = function () {
            var ret = wasm.memory;
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_closure_wrapper4220 = function (arg0, arg1, arg2) {
            var ret = makeMutClosure(arg0, arg1, 512, __wbg_adapter_28);
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_closure_wrapper7543 = function (arg0, arg1, arg2) {
            var ret = makeMutClosure(arg0, arg1, 909, __wbg_adapter_31);
            return addHeapObject(ret);
          };
          if (typeof input === 'string' || typeof Request === 'function' && input instanceof Request || typeof URL === 'function' && input instanceof URL) {
            input = fetch(input);
          }
          _context2.t0 = load;
          _context2.next = 80;
          return input;
        case 80:
          _context2.t1 = _context2.sent;
          _context2.t2 = imports;
          _context2.next = 84;
          return (0, _context2.t0)(_context2.t1, _context2.t2);
        case 84:
          _yield$load = _context2.sent;
          instance = _yield$load.instance;
          module = _yield$load.module;
          wasm = instance.exports;
          init.__wbindgen_wasm_module = module;
          wasm.__wbindgen_start();
          return _context2.abrupt("return", wasm);
        case 91:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _init.apply(this, arguments);
}
var _default = exports["default"] = init;
