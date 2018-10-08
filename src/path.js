const pathMap = new Map();

function Path(regexp) {
    console.assert(regexp, 'decorator must have arguments, like "@path(\'/test/:test\')"');
    return function(target, propertyKey) {
        const regexpArr = pathMap.get(target.constructor) || [];

        regexpArr.push({
            regexp,
            propertyKey,
        });

        pathMap.set(target.constructor, regexpArr);
    }
};

export {
    Path,
    pathMap,
}
