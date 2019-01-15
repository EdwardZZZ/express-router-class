export default class Controller {

    /**
     * 前置方法
     */
    __before() {}

    /**
     * 后置方法
     */
    __after() {}

    /**
     * 初始化 ctx
     */
    set ctx({ res, req, next }) {
        if (this.res && this.req && this.next) {
            throw new Error('Please do not set ctx yourself.');
        }

        this.res = res;
        this.req = req;
        this.next = next;
    }

    /**
     * 获取 ctx
     */
    get ctx() {
        const { req, res, next } = this;
        return { reqest: req, response: res, next };
    }

    /**
     * json返回
     * @param  {...any} props 参数
     */
    json(...props) {
        return this.res.json(props);
    }

    /**
     * jsonp返回
     * @param  {...any} props 参数
     */
    jsonp(...props) {
        return this.res.jsonp(props);
    }

    /**
     * 模板渲染返回
     * @param  {...any} props 参数
     */
    render(...props) {
        return this.res.render(props);
    }
}
