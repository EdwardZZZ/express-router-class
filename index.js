"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e.default:e}function Path(e){return console.assert(e,"decorator must have arguments, like \"@path('/test/:test')\""),function(t,r){const o=pathMap.get(t.constructor)||[];o.push({regexp:e,propertyKey:r}),pathMap.set(t.constructor,o)}}function initMap(){console.log("--init route--");const{controllerDir:controllerDir,controllerSuffix:controllerSuffix,regexpFile:regexpFile}=config$1.getConfig(),e=new RegExp(`([a-zA-Z0-9_]+)${controllerSuffix}.js`);if(console.assert(fs.existsSync(controllerDir),`controller filepath may need to be set, default:${controllerDir}`),fs.readdirSync(controllerDir).forEach(t=>{const r=t.match(e);if(r){console.log(t);const e=require(path.resolve(controllerDir,t)),o=Reflect.construct(e,[]),n=pathMap.get(e);n&&n.length>0&&n.forEach(({regexp:regexp,propertyKey:propertyKey})=>{regexpMap.set(pathToRegexp(regexp),{instance:o,method:o[propertyKey]})}),controllerMap.set(r[1].toLocaleLowerCase(),o)}}),regexpFile){const e=require(regexpFile);Object.keys(e).forEach(t=>{const r=e[t].slice(1);const o=r.split("/");if(2!==o.length)return;const[n,c]=o;const p=controllerMap.get(n);if(!p)return;const s=p[c];if(!s)return;regexpMap.set(pathToRegexp(t),{instance:p,method:s})})}}function callMethod(e,t,r,o,n,c){e.ctx=o.app,e.req=o,e.res=n,e.next=c;const{__before:__before,__after:__after}=e;let p=Promise.resolve();__before&&(p=Promise.resolve(Reflect.apply(__before,e,[]))),p.then(o=>{if(!1===o)return!1;return Reflect.apply(t,e,r)}).then(t=>{if(!1===t)return!1;__after&&Reflect.apply(__after,e,[]);return t}).catch(e=>{console.log(e)})}function pathRegexp(e,t,r){for(let[o,n]of regexpMap){const c=o.exec(e.path);if(c){const{instance:instance,method:method}=n;return callMethod(instance,method,c.slice(1),e,t,r),!0}}return!1}function Router(e,t,r){if(controllerMap.size||initMap(),!pathRegexp(e,t,r)){const o=(e.path.slice(1)||"/index/index").split("/");if(o.length<2)return r();const[n,c,...p]=o;if(!c.indexOf("_"))return r();const s=controllerMap.get(n);if(!s)return r();const i=s[c];if(!i)return r();callMethod(s,i,p,e,t,r)}}Object.defineProperty(exports,"__esModule",{value:!0});var fs=_interopDefault(require("fs")),path=_interopDefault(require("path")),pathToRegexp=_interopDefault(require("path-to-regexp"));const pathMap=new Map,process=require("process"),config={controllerDir:path.resolve(process.cwd(),"src/controller"),controllerSuffix:"Controller",regexpFile:null};var config$1={setConfig(e){Object.assign(config,e)},getConfig(){return config}};const regexpMap=new Map,controllerMap=new Map,{setConfig:setConfig}=config$1;exports.Path=Path,exports.Router=Router,exports.setConfig=setConfig;
