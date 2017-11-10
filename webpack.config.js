const path = require("path");
const fs = require("fs");
const nodeModules = {};

fs.readdirSync("node_modules")
    .filter(function (x) {
        return [".bin"].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = "commonjs " + mod;
    });

module.exports = {
    entry: {
        "bundle": "./app/app.js",
        "unit": "./app/modules/unit.js"
    },
    output: {
        path: path.resolve(__dirname, "./public/js"),
        filename: "[name].js",
        publicPath: "/public/js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        presets: ["env", "react"],
                        plugins: ["transform-object-rest-spread"]
                    }
                }]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.svg$|\.woff$|\.woff2$|\.[ot]tf$|\.eot$|\.png$/,
                loader: "url-loader"
            }
        ]
    },
    plugins: [

    ],
    target: "electron-renderer",
    externals: nodeModules,
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
};