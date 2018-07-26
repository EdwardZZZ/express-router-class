'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var pathToRegexp = _interopDefault(require('path-to-regexp'));

var pathMap = new Map();

function Path(regexp) {
    console.assert(regexp, 'decorator must have arguments, like "@path(\'/test/:test\')"');
    return function (target, propertyKey) {
        pathMap.set(target.constructor, {
            regexp: regexp,
            propertyKey: propertyKey
        });
    };
}

var process = require('process');

var config = {
    controllerDir: path.resolve(process.cwd(), 'src/controller'),
    controllerSuffix: 'Controller',
    regexpFile: null
};

var config$1 = {
    setConfig: function setConfig(params) {
        Object.assign(config, params);
    },
    getConfig: function getConfig() {
        return config;
    }
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();











var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var regexpMap = new Map();

var controllerMap = new Map();
function initMap() {
    console.log('--init route--');

    var _config$getConfig = config$1.getConfig(),
        controllerDir = _config$getConfig.controllerDir,
        controllerSuffix = _config$getConfig.controllerSuffix,
        regexpFile = _config$getConfig.regexpFile;

    var reg = new RegExp('([a-zA-Z0-9_]+)' + controllerSuffix + '.js');
    console.assert(fs.existsSync(controllerDir), 'controller filepath may need to be set, default:' + controllerDir);
    // 读取controller目录
    fs.readdirSync(controllerDir).forEach(function (name) {
        var result = name.match(reg);
        if (result) {
            console.log(name);
            var clazz = require(path.resolve(controllerDir, name));
            var instance = new clazz();

            if (pathMap.has(clazz)) {
                var _pathMap$get = pathMap.get(clazz),
                    regexp = _pathMap$get.regexp,
                    propertyKey = _pathMap$get.propertyKey;

                regexpMap.set(pathToRegexp(regexp), { instance: instance, method: instance[propertyKey] });
            }

            controllerMap.set(result[1].toLocaleLowerCase(), instance);
        }
    });

    // 配置路由文件
    if (regexpFile) {
        var regexps = require(regexpFile);
        Object.keys(regexps).forEach(function (regexp) {
            var url = regexps[regexp].slice(1);
            var pathArr = url.split('\/');
            if (pathArr.length !== 2) return;

            var _pathArr = slicedToArray(pathArr, 2),
                className = _pathArr[0],
                methodName = _pathArr[1];

            var instance = controllerMap.get(className);
            if (!instance) return;
            var method = instance[methodName];
            if (!method) return;

            regexpMap.set(pathToRegexp(regexp), { instance: instance, method: method });
        });
    }
}

// 调用对应方法
function callMethod(instance, method, params, req, res, next) {
    instance.ctx = req.app;
    instance.req = req;
    instance.res = res;
    instance.next = next;

    var __before = instance.__before,
        __after = instance.__after;

    var promise = Promise.resolve();
    if (__before) {
        promise = Promise.resolve(__before.apply(instance));
    }

    promise.then(function (data) {
        if (data === false) return false;
        return method.apply(instance, params);
    }).then(function (data) {
        if (data === false) return false;
        __after && __after.apply(instance);
        return data;
    }).catch(function (e) {
        console.log(e);
    });
}

// path-to-regexp
function pathRegexp(req, res, next) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = regexpMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = slicedToArray(_step.value, 2),
                key = _step$value[0],
                value = _step$value[1];

            var result = key.exec(req.path);
            if (result) {
                var instance = value.instance,
                    method = value.method;

                callMethod(instance, method, result.slice(1), req, res, next);
                return true;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return false;
}

// 路由中间件
function Router(req, res, next) {
    controllerMap.size || initMap();

    if (pathRegexp(req, res, next)) return;

    var url = req.path.slice(1) || '/index/index';

    var pathArr = url.split('\/');
    if (pathArr.length < 2) {
        return next();
    }

    var _pathArr2 = toArray(pathArr),
        className = _pathArr2[0],
        methodName = _pathArr2[1],
        params = _pathArr2.slice(2);
    // 方法不能以'_'开头，regexp配置的除外


    if (!methodName.indexOf('_')) {
        return next();
    }

    var instance = controllerMap.get(className);
    if (!instance) {
        return next();
    }
    var method = instance[methodName];
    if (!method) {
        return next();
    }

    callMethod(instance, method, params, req, res, next);
}

var setConfig = config$1.setConfig;

exports.Path = Path;
exports.Router = Router;
exports.setConfig = setConfig;
