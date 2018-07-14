# express-router-class

simple router
default controller dir 'src/controller'
default route 'index/index'

### setting
```js
const { setConfig } = require('express-router-class');
setConfig({
    controllerDir: '***'    // default 'src/controller'
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
    // route 'index/index'
    index() {
        // this.res
        // this.req
        // this.ctx
    }
    // route 'index/test'
    test() {
        
    }
}
```