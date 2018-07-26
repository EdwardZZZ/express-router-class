import path from 'path';
const process = require('process');

const config = {
    controllerDir: path.resolve(process.cwd(), 'src/controller'),
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