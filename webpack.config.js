const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry:  './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'WebVisu.dev.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                enforce: 'pre',
                loader: ["source-map-loader", "eslint-loader"]
            }
        ]
    },
}