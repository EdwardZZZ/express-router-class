
export default class Controller {
    /**
     * json返回
     * @param  {...any} props 参数
     */
    json(...props) {
        this.res.json(props);
    }

    /**
     * jsonp返回
     * @param  {...any} props 参数
     */
    jsonp(...props) {
        this.res.jsonp(props);
    }

    /**
     * 模板渲染返回
     * @param  {...any} props 参数
     */
    render(...props) {
        this.res.render(props);
    }
}

