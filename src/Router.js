import fs from 'fs';
import path from 'path';
import pathToRegexp from 'path-to-regexp';

import { pathMap } from './path';
import config from './config';

const regexpMap = new Map();

const controllerMap = new Map();
function initMap() {
    console.log('--init route--');
    const { controllerDir, controllerSuffix } = config.getConfig();

    const reg = new RegExp(`([a-zA-Z0-9_]+)${controllerSuffix}.js`)
    console.assert(fs.existsSync(controllerDir), `controller filepath may need to be set, default:${controllerDir}`);
    fs.readdirSync(controllerDir).forEach(function(name) {
        const result = name.match(reg);
        if (result) {
            console.log(name);
            const clazz = require(path.resolve(controllerDir, name));
            const instance = new clazz();

            if (pathMap.has(clazz)) {
                const { regexp, propertyKey } = pathMap.get(clazz);
                regexpMap.set(pathToRegexp(regexp), { instance, method: propertyKey });
            }

            controllerMap.set(result[1].toLocaleLowerCase(), instance);
        }
    })
}

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

function pathRegexp(req, res, next) {
    for (let [key, value] of regexpMap) {
        const result = key.exec(req.path);
        if (result) {
            const { instance, method } = value;
            callMethod(instance, method, result, req, res, next);
            return true;
        }
    }

    return false;
}

function Router(req, res, next) {
    if (pathRegexp(req, res, next)) return;

    controllerMap.size || initMap();

    const url = req.path.slice(1) || 'index';
    if (/^\d+$/.test(url)) {
        return next();
    }

    const pathArr = url.split('\/');
    const [className = 'index', methodName = 'index', ...params] = pathArr;

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