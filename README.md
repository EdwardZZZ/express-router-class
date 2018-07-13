# express-router-class

simple router

default 'index/index'

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
    }
    // route 'index/test'
    test() {
        
    }
}
```