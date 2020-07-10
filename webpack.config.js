const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry:  './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webvisu.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'webvisu.html',
            template: './src/index.html',
            title: 'WebVisualisation',
        })
    ],
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
    stats: {
        children: false, 
    },
}