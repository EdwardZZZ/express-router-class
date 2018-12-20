import fs from 'fs';
import path from 'path';
import pathToRegexp from 'path-to-regexp';

import { pathMap } from './path';
import config from './config';

let modules = false;
let defaultModule = 'home';
const regexpMap = new Map();
const moduleMap = new Map();

function initMap() {
    console.log('--init route--');
    const {
        defaultModule: _defaultModule,
        modules: _modules,
        controllerRoot,
        controllerSuffix,
        regexpFile
    } = config.getConfig();
    modules = _modules;
    defaultModule = _defaultModule;

    const reg = new RegExp(`([a-zA-Z0-9_]+)${controllerSuffix}.js`)
    // 读取controller目录
    if (modules) {
        modules.forEach((module) => {
            readControllerDir(reg, path.resolve(controllerRoot, module), module);
        });
    } else {
        readControllerDir(reg, controllerRoot);
    }

    // 配置路由文件
    if (regexpFile) {
        const regexps = require(regexpFile);
        for(let regexp in regexps){
            const url = regexps[regexp].slice(1);
            const pathArr = url.split('\/');

            if (!modules) {
                pathArr.splice(0, 0, defaultModule);
            }

            const [module, className = 'index', methodName = 'index'] = pathArr;

            if (!moduleMap.has(module)) return;
            const controllerMap = moduleMap.get(module);
            const instance = controllerMap.get(className);
            if (!instance) return;
            const method = instance[methodName];
            if (!method) return;

            console.log(regexp, className, method.name);
            regexpMap.set(pathToRegexp(regexp), { instance, method });
        }
    }
}

function readControllerDir(reg, dir, module = defaultModule) {
    const controllerDir = path.resolve(dir, 'controller');
    console.assert(fs.existsSync(controllerDir), `controller file path is not exists, path:${controllerDir}`);

    const controllerMap = new Map();
    fs.readdirSync(controllerDir).forEach((name) => {
        const result = name.match(reg);
        if (result) {
            console.log(name);
            const clazz = require(path.resolve(controllerDir, name));
            const instance = Reflect.construct(clazz, []);

            const regexpArr = pathMap.get(clazz);
            if (regexpArr && regexpArr.length > 0) {
                regexpArr.forEach(({ regexp, propertyKey }) => {
                    console.log(regexp, name, propertyKey);
                    regexpMap.set(pathToRegexp(regexp), { instance, method: instance[propertyKey] });
                });
            }

            controllerMap.set(result[1].toLocaleLowerCase(), instance);
        }
    });

    moduleMap.set(module, controllerMap);
}

// 调用对应方法
function callMethod(instance, method, params, req, res, next) {
    instance.ctx = req.app;
    instance.req = req;
    instance.res = res;
    instance.next = next;

    const { __before, __after } = instance;
    const promise = Promise.resolve(__before ? Reflect.apply(__before, instance, []) : void 0);

    promise.then(data => {
        if (data === false) return false;
        return Reflect.apply(method, instance, params);
    }).then(data => {
        if (data === false) return false;
        return Promise.resolve(__after ? Reflect.apply(__after, instance, []) : void 0);
    }).catch(e => {
        console.error(e);
    });
}

// path-to-regexp
function pathRegexp(req, res, next) {
    for (let [key, value] of regexpMap) {
        const result = key.exec(req.path);
        if (result) {
            const { instance, method } = value;
            callMethod(instance, method, result.slice(1), req, res, next);
            return true;
        }
    }

    return false;
}

// 路由中间件
function Router(req, res, next) {
    moduleMap.size || initMap();

    // 匹配map
    if (pathRegexp(req, res, next)) return;

    // 默认匹配
    const url = req.path.slice(1);
    const pathArr = url ? url.split('/') : [];
    if (!modules) {
        pathArr.splice(0, 0, defaultModule);
    }

    const [module = defaultModule, className = 'index', methodName = 'index', ...params] = pathArr;
    // 方法不能以'_'开头，regexp配置的除外
    if (!methodName.indexOf('_')) {
        return next();
    }

    const controllerMap = moduleMap.get(module);
    if (!controllerMap) {
        return next();
    }

    const instance = controllerMap.get(className);
    if (!instance) {
        return next();
    }
    const method = instance[methodName];
    if (!method) {
        return next();
    }

    callMethod(instance, method, params, req, res, next);
}

export default Router;