const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

module.exports = {
    mode: 'production', // "production" | "development" | "none"
    //devtool: 'source-map', // enum
    entry: {
        Loader: './src/loader/index.ts',
        WebVisuApp: './src/app/index.ts'
    }, 

    output: {
        path: path.resolve(__dirname, 'dist'), // string
        filename: '[name].js',
        clean: true
    },
    plugins: [
        // Add the script tag of loader to the HTML
        new HtmlWebpackPlugin({
            title: 'WebVisualisation',
            filename: 'webvisu.html',
            inject: 'body',
            template: './src/index.html'
        }),

        // Compress
        new CompressionPlugin({
            filename: '[path][base].gz',
            exclude: 'Loader',
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
            deleteOriginalAssets: true
        }),

        // Inline the loader to the webvisu.html to reduce the number of files to 2
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/Loader/]),
    ],
    resolve: {
        // options for resolving module requests
        // (does not apply to resolving to loaders)
        extensions: ['.ts', '.tsx', '.js'],
        fallback: { "path": false, "fs": false},
    },
    module: {
        // configuration regarding modules
        rules: [
            // rules for modules (configure loaders, parser options, etc.)
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
                exclude: [/node_modules/],
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                use: [ 'eslint-loader'],
            },
        ],
    },
    /*
    stats: {
        // lets you precisely control what bundle information gets displayed
        children: false,
        // show stats for child compilations
    },
    |   Preset              |   Alternative |   Description
    |   'errors-only'       |   none        |   Only output when errors happen
    |   'errors-warnings'   |   none        |   Only output errors and warnings happen
    |   'minimal'           |	none        |	Only output when errors or new compilation happen
    |   'none'              |	false       |	Output nothing
    |   'normal'            |   true        |	Standard output
    |   'verbose'           |	none        |	Output everything
    |   'detailed'          |	none        |	Output everything except chunkModules and chunkRootModules
    */
    stats: 'normal',
    performance: {
        hints: false // enum string = 'warning': 'error' | 'warning' boolean: false
        // maxAssetSize: 1048576, // 1024 1k byte, 1048576 1m byte, 1073741824, 1099511627776,
        // maxEntrypointSize: 1048576,
        // hints: 'error' // enum string = 'warning': 'error' | 'warning' boolean: false
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
};
