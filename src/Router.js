import fs from 'fs';
import path from 'path';
import config from './config';

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
            controllerMap.set(result[1].toLocaleLowerCase(), new clazz());
        }
    })
}

function Router(req, res, next) {
    controllerMap.size || initMap();

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

    clazz.ctx = req.app;
    clazz.req = req;
    clazz.res = res;
    clazz.next = next;
    const method = clazz[methodName];
    if (!method) {
        return next();
    }
    clazz.__before && clazz.__before.apply(clazz);
    method.apply(clazz, params);
    clazz.__after && clazz.__after.apply(clazz);
}

export default Router;