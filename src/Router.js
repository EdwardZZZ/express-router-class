import fs from 'fs';
import path from 'path';
import pathToRegexp from 'path-to-regexp';

import { pathMap } from './path';
import config from './config';

const regexpMap = new Map();

const controllerMap = new Map();
function initMap() {
    console.log('--init route--');
    const { controllerDir, controllerSuffix, regexpFile } = config.getConfig();

    const reg = new RegExp(`([a-zA-Z0-9_]+)${controllerSuffix}.js`)
    console.assert(fs.existsSync(controllerDir), `controller filepath may need to be set, default:${controllerDir}`);
    // 读取controller目录
    fs.readdirSync(controllerDir).forEach((name) => {
        const result = name.match(reg);
        if (result) {
            console.log(name);
            const clazz = require(path.resolve(controllerDir, name));
            const instance = new clazz();

            if (pathMap.has(clazz)) {
                const { regexp, propertyKey } = pathMap.get(clazz);
                regexpMap.set(pathToRegexp(regexp), { instance, method: instance[propertyKey] });
            }

            controllerMap.set(result[1].toLocaleLowerCase(), instance);
        }
    });

    // 配置路由文件
    if (regexpFile) {
        const regexps = require(regexpFile);
        Object.keys(regexps).forEach((regexp) => {
            const url = regexps[regexp].slice(1);
            const pathArr = url.split('\/');
            if (pathArr.length !== 2) return;

            const [className, methodName] = pathArr;

            const instance = controllerMap.get(className);
            if (!instance) return;
            const method = instance[methodName];
            if (!method) return;

            regexpMap.set(pathToRegexp(regexp), { instance, method });
        })
    }
}

// 调用对应方法
function callMethod(instance, method, params, req, res, next) {
    instance.ctx = req.app;
    instance.req = req;
    instance.res = res;
    instance.next = next;

    const { __before, __after } = instance;
    let promise = Promise.resolve();
    if (__before) {
        promise = Promise.resolve(__before.apply(instance));
    }

    promise.then(data => {
        if (data === false) return false;
        return method.apply(instance, params);
    }).then(data => {
        if (data === false) return false;
        __after && __after.apply(instance);
        return data;
    }).catch(e => {
        console.log(e);
    })
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
    controllerMap.size || initMap();

    if (pathRegexp(req, res, next)) return;

    const url = req.path.slice(1) || '/index/index';

    const pathArr = url.split('\/');
    if (pathArr.length < 2) {
        return next();
    }

    const [className, methodName, ...params] = pathArr;
    // 方法不能以'_'开头，regexp配置的除外
    if (!methodName.indexOf('_')) {
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