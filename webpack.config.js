const path = require('path');
// const webpack = require('webpack'); // used for image transparency modification (failed)
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// Only to enable compression
// const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    mode: 'production', // "production" | "development" | "none"
    // Chosen mode tells webpack to use its built-in optimizations accordingly
    devtool: 'source-map', // enum
    // enhance debugging by adding meta info for the browser devtools
    // source-map most detailed at the expense of build speed.
    entry: './src/index.ts', // string | object | array
    // defaults to ./src
    // Here the application starts executing
    // and webpack starts bundling
    output: {
        // options related to how webpack emits results
        path: path.resolve(__dirname, 'dist'), // string
        // the target directory for all output files
        // must be an absolute path (use the Node.js path module)
        filename: 'webvisu.js', // string
        // the filename template for entry chunks
    },
    plugins: [
        /* // used for image transparency modification (failed)
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        */
        // list of additional plugins
        new HtmlWebpackPlugin({
            filename: 'webvisu.html',
            template: './src/index.html',
            title: 'WebVisualisation',
        }),
        // Only to enable compression
        /*
        new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        */
    ],
    resolve: {
        // options for resolving module requests
        // (does not apply to resolving to loaders)
        extensions: ['.ts', '.tsx', '.js'],
        // extensions that are used
        /* // used for image transparency modification (failed)
        alias: {
            buffer: 'buffer',
        },
        */
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
                use: ['source-map-loader', 'eslint-loader'],
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
        // removeAvailableModules: true,
        // removeEmptyChunks: true,
        // providedExports: true,
        // usedExports: 'global',
    },
};
