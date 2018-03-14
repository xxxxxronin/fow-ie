/**
 *
 * @type {{}}
 */
const ExtractTextPlugin = require("extract-text-webpack-plugin");

var path = require("path");
var MyHtmlPlugin = require("./html-plugin");
var presetsList = [];
var __envKey = require.resolve("babel-preset-env");
presetsList.push([__envKey,{"targets":{"browsers":["last 2 versions", "ie 8"]}}]);
presetsList.push(require.resolve("babel-preset-react"));
var es3ifyPlugin = require('es3ify-webpack-plugin');
module.exports  = function (env) {
    return {
        entry:{},
        plugins:[
            new MyHtmlPlugin({options: ''})
        ],
        stats:"errors-only",
        context:env.cwd,
        module:{
            rules:[

                {
                    test: /\.(js)$/,
                    use:['es3ify-loader']
                },
                {
                    test: /\.(js|jsx)$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: presetsList
                        }
                    },
                    exclude: [
                        path.resolve(__dirname, '../node_modules/'),
                        path.resolve(env.cwd, 'node_modules/')
                    ]
                },
                {
                    test: /\.css$/,
                    use:  ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    // If you are having trouble with urls not resolving add this setting.
                                    // See https://github.com/webpack-contrib/css-loader#url
                                    url: false,
                                    minimize: true,
                                    sourceMap: true,
                                    modules:true
                                }
                            }
                        ]
                    })
                },
                {test:/\.(png|svg|jpg|gif)$/, use: ['file-loader']},
                {test:/\.tsx?$/, use: "ts-loader",exclude: /node_modules/}

            ]

        },
        resolve:{
            extensions: [ '.tsx', '.ts', '.js',".css",'.jsx' ],
            modules:[path.resolve(__dirname, '../node_modules'),"node_modules"]
        },
        resolveLoader:{
            modules:[path.resolve(__dirname, '../node_modules'),"node_modules"]
        },
        externals: {
            jquery: 'window.$'
        }
    }

}