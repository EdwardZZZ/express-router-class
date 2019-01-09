import router from './Router';
import config from './config';
import { PathDecorator } from './path';
import Controller from './Controller';

export default {
    Path: PathDecorator,
    Controller,
    Router(cfg = {}) {
        config.setConfig(cfg);
        return router;
    },
};