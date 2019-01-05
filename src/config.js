import path from 'path';
const process = require('process');

const config = {
    timeout: 10e3,
    modules: false,
    defaultModule: 'home',
    controllerRoot: path.resolve(process.cwd(), 'src'),
    controllerSuffix: 'Controller',
    regexpFile: null,
}

export default {
    setConfig(params) {
        Object.assign(config, params);
    },
    getConfig() {
        return config;
    }
}