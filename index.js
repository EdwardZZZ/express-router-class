"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e.default:e}function initMap(){console.log("--init route--");var e=config$1.getConfig(),r=e.controllerDir,o=e.controllerSuffix,t=new RegExp("([a-zA-Z0-9_]+)"+o+".js");console.assert(fs.existsSync(r),"controller filepath may need to be set, default:"+r),fs.readdirSync(r).forEach(function(e){var o=e.match(t);if(o){console.log(e);var n=require(path.resolve(r,e));controllerMap.set(o[1].toLocaleLowerCase(),new n)}})}function Router(e,r,o){controllerMap.size||initMap();var t=e.path.slice(1)||"index";if(/^\d+$/.test(t))return o();var n=t.split("/"),i=toArray(n),a=i[0],f=void 0===a?"index":a,l=i[1],s=void 0===l?"index":l,c=i.slice(2),p=controllerMap.get(f);if(!p)return o();p.ctx=e.app,p.req=e,p.res=r,p.next=o;var u=p[s];if(!u)return o();p.__before&&p.__before.apply(p),u.apply(p,c),p.__after&&p.__after.apply(p)}Object.defineProperty(exports,"__esModule",{value:!0});var fs=_interopDefault(require("fs")),path=_interopDefault(require("path")),process=require("process"),config={controllerDir:path.resolve(process.cwd(),"src/controller"),controllerSuffix:"Controller"},config$1={setConfig:function(e){Object.assign(config,e)},getConfig:function(){return config}},toArray=function(e){return Array.isArray(e)?e:Array.from(e)},controllerMap=new Map,setConfig=config$1.setConfig;exports.Router=Router,exports.setConfig=setConfig;
