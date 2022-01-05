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

exports = module.exports = {
    deprecationLog,
    findZkConstantByCode,
};
