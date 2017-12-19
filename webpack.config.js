const path = require("path").posix;

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
    node: {
        __dirname: false,
        __filename: false
    },
    plugins: [

    ],
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
};