require("babel-register")({
    presets: ["es2015"],
});

global.window = {
    require:require,
    navigator:{
        userAgent:'firefox'
    }
};

