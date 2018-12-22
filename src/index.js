import router from './Router';
import config from './config';
import { PathDecorator } from './path';

export default {
    Path: PathDecorator,
    Router(cfg = {}) {
        config.setConfig(cfg);
        return router;
    },
};