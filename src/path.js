const pathMap = new Map();

function Path(regexp) {
    console.assert(regexp, 'decorator must have arguments, like "@path(\'/test/:test\')"');
    return function(target, propertyKey) {
        pathMap.set(target.constructor, {
            regexp,
            propertyKey,
        });
    }
};

export {
    Path,
    pathMap,
}
