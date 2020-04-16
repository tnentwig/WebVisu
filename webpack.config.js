const path = require('path');

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
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: ["source-map-loader", "eslint-loader"]
            }
        ]
    },
}