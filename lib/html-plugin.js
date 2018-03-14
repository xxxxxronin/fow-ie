/**
 * 进行全局javascript 与css 引用
 * @param options
 * @constructor
 */
function MyHtmlPlugin(options) {
    // Configure your plugin with options...
}
MyHtmlPlugin.prototype.apply = function(compiler) {
    // ...
    compiler.plugin('compilation', function(compilation) {
        console.log('The compiler is starting a new compilation...');
        compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, callback) {
            var commJs = [];
            // commJs.push("/assets/js/jquery.bundle.js?v="+new Date().getTime());
            commJs.push("/assets/js/common.bundle.js?v="+new Date().getTime());
            htmlPluginData.assets.js = commJs.concat(htmlPluginData.assets.js);
            htmlPluginData.assets.css = ["/assets/css/common.bundle.css?v="+new Date().getTime()].concat(htmlPluginData.assets.css);
            callback(null, htmlPluginData);
        });
    });
};
module.exports = MyHtmlPlugin;