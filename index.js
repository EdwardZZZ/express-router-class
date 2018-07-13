'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var app = _interopDefault(require('express'));

const process = require('process');

const config = {
    controllerDir: path.resolve(process.cwd(), 'src/controller')
};

var config$1 = {
    setConfig(params) {
        Object.assign(config, params);
    },
    getConfig() {
        return config;
    }
};

const controllerMap = new Map();
const reg = /([a-zA-Z0-9]+)Controller.js/;

const { controllerDir } = config$1.getConfig();
console.assert(fs.existsSync(controllerDir), `controller filepath may need to be set, default:${controllerDir}`);
fs.readdirSync(controllerDir).forEach(function(name) {
    const result = name.match(reg);
    if (result) {
        const clazz = require(path.resolve(controllerDir, name));
        controllerMap.set(result[1].toLocaleLowerCase(), new clazz());
    }
});

function Router(req, res, next) {
    const url = req.path.slice(1) || 'index';
    if (/^\d+$/.test(url)) {
        return next();
    }

    const pathArr = url.split('\/');
    const [className = 'index', methodName = 'index', ...params] = pathArr;

    const clazz = controllerMap.get(className);
    if (!clazz) {
        return next();
    }

    clazz.ctx = app;
    clazz.req = req;
    clazz.res = res;
    const method = clazz[methodName];
    if (!method) {
        return next();
    }
    clazz.__before && clazz.__before.apply(clazz);
    method.apply(clazz, params);
    clazz.__after && clazz.__after.apply(clazz);
}

const { setConfig } = config$1;

exports.Router = Router;
exports.setConfig = setConfig;
