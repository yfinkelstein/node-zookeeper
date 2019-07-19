const deprecationLog = (className, methodName) => {
    console.warn(`ZOOKEEPER LOG: ${className}::${methodName} is being deprecated!`);
};

exports = module.exports = {
    deprecationLog,
};
