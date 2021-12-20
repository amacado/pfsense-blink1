//webpack.config.js
const path              = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    target: 'node',
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        main: "./src/index.ts",
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: "bundle.js" // <--- Will be compiled to this single file
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    externals: {
        "node-hid": "commonjs node-hid"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
                                  patterns: [
                                      {from: 'node_modules/node-hid/**/*'}, /* required dependencies which are not build but copied from node_modules */
                                      {from: 'node_modules/bindings/**/*'}, /* required dependencies which are not build but copied from node_modules */
                                      {from: 'node_modules/file-uri-to-path/**/*'}, /* required dependencies which are not build but copied from node_modules */
                                      {from: '.env.sample'},
                                  ]
                              }),
    ],
};
