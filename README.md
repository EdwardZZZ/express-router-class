# express-router-class

    simple router
    support config routes
    support decorator base on path-to-regexp

### setting

    All of settings have default value
    default controller dir 'src/controller'
    default route 'index/index'

```js
const { setConfig } = require('express-router-class');
setConfig({
    modules: ['home', 'admin'] // default false,
    controllerRoot: '***'   // default 'src', controllerDir src/controller
                            // if setting modules: ['home'], controllerDir will transform to ['src/home/controller']
    controllerSuffix: '',   // default 'Controller',
    regexpFile: path.resolve(process.cwd(), 'src/config/routes'),       // default null,
});
```
```js
// router.js
module.exports = {
    '/404': 'common/notfound',
    '/502': 'common/__error',
    '/test/:no(\\d+)': 'common/__error',
}
```

### usage
```js
const { Router } = require('express-router-class');
app.use(Router);
```

```js
const { Path } = require('express-router-class');

// controller
export default class Index{
    __before() {}
    __after() {}

    // route 'index/index'
    index() {
        // this.res
        // this.req
        // this.next
    }

    // route 'index/rest/1/2/3'
    rest(a, b, c) {
        console.log(a, b, c); // 1, 2, 3
    }

    // route 'index/test/a/b/c/d'
    test(...props) {
        console.log(props); // ['a', 'b', 'c', 'd']
    }

    // route '/123'
    @Path('/:ddd')
    decorator(ddd) {
        console.log(ddd); // '123'
    }
}
```