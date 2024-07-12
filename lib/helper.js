const deprecationLog = (className, methodName) => {
    console.warn(`ZOOKEEPER LOG: ${className}::${methodName} is being deprecated!`);
};

function findZkConstantByCode(code, constants) {
    const fallback = ['unknown', code];

    try {
        const res = Object.entries(constants).find(([, v]) => v === code);

        return res || fallback;
    } catch (e) {
        return fallback;
    }
}

function isString(data) {
    return typeof data === 'string' || data instanceof String;
}

function isFunction(data) {
    return typeof data === 'function';
}

function toCompatibleAcl(acl) {
    return acl.map((item) => {
        const { perms: perm, ...rest } = item;
        return { perm, ...rest };
    });
}

module.exports = {
    deprecationLog,
    findZkConstantByCode,
    isString,
    isFunction,
    toCompatibleAcl,
};
