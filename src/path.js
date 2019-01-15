const pathMap = new Map();

function PathDecorator(regexp) {
    console.assert(regexp, 'decorator must have arguments, like "@path(\'/test/:test\')"');
    return function(...props) {
        if (props.length === 3) {
            const [target, propertyKey] = props;
            const regexpArr = pathMap.get(target.constructor) || [];

            regexpArr.push({
                regexp,
                propertyKey,
            });

            pathMap.set(target.constructor, regexpArr);
        } else if (props.length === 1) {
            const [constructor] = props;
            constructor.__rootPath = regexp;
            return constructor;
        }
    }
};

export {
    PathDecorator,
    pathMap,
}
