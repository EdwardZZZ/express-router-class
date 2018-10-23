import path from 'path';
const process = require('process');

const config = {
    modules: false,
    controllerDir: path.resolve(process.cwd(), 'src'),
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