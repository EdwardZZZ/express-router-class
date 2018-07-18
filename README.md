# express-router-class

simple router
default controller dir 'src/controller'
default route 'index/index'

### setting
```js
const { setConfig } = require('express-router-class');
setConfig({
    controllerDir: '***'    // default 'src/controller',
    controllerSuffix: ''    // default 'Controller',
})
```

### usage
```js
const { Router } = require('express-router-class');

app.use(Router);
```

```js
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
}
```