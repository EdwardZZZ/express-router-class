import Router from './Router';
import config from './config';
import { PathDecorator } from './path';

const { setConfig } = config;

export default {
    Path: PathDecorator,
    Router,
    setConfig,
};