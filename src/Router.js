import fs from 'fs';
import path from 'path';
import express from 'express';
import pathToRegexp from 'path-to-regexp';

import { pathMap } from './path';
import config from './config';

let modules = false;
let defaultModule = 'home';
const regexpMap = new Map();
const moduleMap = new Map();
const regexpMethodMap = new Map();
let controllerReg = null;

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

    controllerReg = new RegExp(`([a-zA-Z0-9_]+)${controllerSuffix}.js`)
    // 读取controller目录
    if (modules) {
        modules.forEach((module) => {
            readControllerDir(path.resolve(controllerRoot, module, 'controller'), module);
        });
    } else {
        readControllerDir(path.resolve(controllerRoot, 'controller'));
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
            const clazz = controllerMap.get(className);
            if (!clazz) return;
            if (!Reflect.ownKeys(clazz.prototype).indexOf(methodName)) return;

            addToRegexpMap(regexp, clazz, methodName);
        }
    }
}

function addToRegexpMap(regexp, clazz, methodName) {
    console.log(regexp, clazz.name, methodName);
    regexpMap.set(pathToRegexp(regexp), { clazz, methodName });

    const methods = regexpMethodMap.get(clazz) || [];
    methods.push(methodName);
    regexpMethodMap.set(clazz, methods);
}

function readControllerDir(controllerDir, module = defaultModule) {
    console.assert(fs.existsSync(controllerDir), `controller file path is not exists, path:${controllerDir}`);

    const controllerMap = new Map();
    fs.readdirSync(controllerDir).forEach((name) => {
        const filePath = path.resolve(controllerDir, name);
        if (fs.statSync(filePath).isDirectory()) {
            readControllerDir(filePath, module);
            return;
        }

        const result = name.match(controllerReg);
        if (result) {
            console.log(name);
            const clazz = require(filePath);

            const regexpArr = pathMap.get(clazz);
            if (regexpArr && regexpArr.length > 0) {
                regexpArr.forEach(({ regexp, propertyKey }) => {
                    addToRegexpMap(regexp, clazz, propertyKey);
                });
            }

            controllerMap.set(result[1].toLocaleLowerCase(), clazz);
        }
    });

    moduleMap.set(module, controllerMap);
}

// 调用对应方法
async function callMethod(clazz, methodName, params, req, res, next) {
    const { timeout } = config.getConfig();
    const timeoutFn = setTimeout(() => {
        next(new Error(`TimeoutException: timeout: ${timeout}, url: ${req.originalUrl}`));
    }, timeout);
    try {
        const instance = Reflect.construct(clazz, []);
        instance.req = req;
        instance.res = res;
        instance.next = next;
        const { __before, __after } = instance;

        const beforeResult = await Promise.resolve(__before ? Reflect.apply(__before, instance, []) : void 0);
        if (beforeResult === false) {
            clearTimeout(timeoutFn);
            return;
        }

        const method = Reflect.get(instance, methodName)
        const methodResult = await Promise.resolve(Reflect.apply(method, instance, params));
        clearTimeout(timeoutFn);
        if (methodResult === false) {
            return methodResult;
        }

        await Promise.resolve(__after ? Reflect.apply(__after, instance, []) : void 0);

        // if (!res.headersSent) {
        //     let clazzName = clazz.name;
        //     if (clazzName === '_class') {
        //         for (let [, controllerMap] of moduleMap) {
        //             for (let [key, clz] of controllerMap) {
        //                 if(clz === clazz) {
        //                     clazzName = key;
        //                 }
        //             }
        //         }
        //     }
        //     return next(new Error(`${clazzName}.${methodName}() did not send content.`));
        // }
        return methodResult;
    } catch (err) {
        clearTimeout(timeoutFn);
        next(err);
    }
}

// path-to-regexp
function pathRegexp(path) {
    for (let [key, value] of regexpMap) {
        const result = key.exec(path);
        if (result) {
            const { clazz, methodName } = value;
            return {
                clazz, methodName, params: result.slice(1)
            };
        }
    }

    return false;
}

// 路由中间件
async function Router(req, res, next) {
    try {
        moduleMap.size || initMap();

        // 匹配map
        const pathRegexpResult = pathRegexp(req.path);
        if (pathRegexpResult) {
            const { clazz, methodName, params } = pathRegexpResult;
            return await callMethod(clazz, methodName, params, req, res, next);
        }

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

        const clazz = controllerMap.get(className);
        if (!clazz) {
            return next();
        }

        if (Reflect.ownKeys(clazz.prototype).indexOf(methodName) === -1) {
            return next();
        }

        if (regexpMethodMap.has(clazz) && regexpMethodMap.get(clazz).indexOf(methodName) > -1) {
            return next();
        }

        return await callMethod(clazz, methodName, params, req, res, next);
    } catch(err) {
        next(err);
    }
}

export default express.Router().all('*', Router);