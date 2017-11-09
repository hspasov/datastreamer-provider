const path = require("path");

module.exports = {
    entry: "./app/app.js",
    output: {
        path: path.resolve(__dirname, "./public/js"),
        filename: "bundle.js",
        publicPath: "/public/js"
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: "babel-loader",
                options: {
                    presets: ["es2015", "env", "react"]
                }
            }]
        }]
    },
    plugins: [

    ]
};