const path = require("path").posix;

module.exports = {
    entry: {
        "bundle": "./app/app.jsx",
        "unit": "./app/units/init.js"
    },
    output: {
        path: path.join(__dirname, "public/js"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$|\.jsx$/,
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
                use: ["url-loader"]
            }
        ]
    },
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
};