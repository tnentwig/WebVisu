const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry:  './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'WebVisu.dev.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                enforce: 'pre',
                loader: "source-map-loader"
            }
        ]
    }
}