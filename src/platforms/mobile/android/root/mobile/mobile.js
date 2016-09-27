var firmata = {},
    require = function (moduleName) {
        // For now we're only requiring the Firmata module
        return { firmata: firmata }[moduleName];
    };
