const path = require('path');
//const HtmlWebpackPlugin = require('html-webpack-plugin');
//const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry:  './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'WebVisu.dev.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
       
    ]
}