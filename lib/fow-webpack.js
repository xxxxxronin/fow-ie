/**
 *webpack 项目打包集成入口
 */
var path = require("path");
var fs = require("fs");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var fileUtil = require('./fileUtil');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const open = require('opn');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpackBaseConfig = require("./webpack.base.config");
const  webpackDevServer = require('webpack-dev-server');
const defaultConfig = require('./default.fow');  //项目默认配置
const extend = require('extend');
class FowWebpack{

    constructor(env,args){
        this.root = env.cwd;  // 目项根目录
        this.__env = env;  //Liftoff env 参数
        this.__args = args; // Liftoff args 参数
        this._webpack = require("webpack");
        this.__server = null;
        this._config = [];
        var configPath = path.resolve(env.cwd,"fow-config.js");
        if(fs.existsSync(configPath)){
            var opts = this.__args["_"];
            this.options = {"start":opts[0],"opt":opts[1] || ""};
            this.projectConfig = extend(true,defaultConfig,this.loadProjectConfigFile(configPath)); //加载项目配置文件
            // this.multiDirectoryConfig();
            this.multiDirectory();
            // console.log(this.__args);
        }else{
            console.error("not foud fow-config.js",configPath);
        }
    }

    loadProjectConfigFile(configPath){
        var config = require(configPath);
        if(typeof config == "function"){
            return config();
        }
        return config;
    }


     /**
      * 根据文件名生成Entry 键名
      * @param modulePath
      * @param filename
      * @returns {*}
      */
    getEntryKey(modulePath,filename){
        var entryName = modulePath.replace(this.__env.cwd,"");
        entryName = entryName.replace(/^[\\\/]|[\\\/]$/gi,"");
        return filename;
        // return entryName.replace(path.sep,"/")+"/"+filename;
    }

    clearRoot(pp){
        var entryName = pp.replace(this.__env.cwd,"");
        entryName = entryName.replace(/^[\\\/]|[\\\/]$/gi,"");
        return entryName;
    }
     /**
      * 全局通用js 与css 打包配置
      */
    commonConfig(){
         var self = this;
         var  __config = Object.assign({},webpackBaseConfig(self.__env));
         __config.entry = {
             'common':["es5-shim","es5-shim/es5-sham",'babel-polyfill',path.resolve(__dirname, 'module/common.js'),"fow-http"]
         };

         if(self.projectConfig.platform == "pc"){
             // __config.entry.common.push(path.resolve(__dirname, 'module/common.jquery.js'));
         }else {
             __config.entry.common.push(path.resolve(__dirname, 'module/common.zeptojs.js'));
         }
         __config.plugins.push( new CleanWebpackPlugin([path.resolve(self.__env.cwd,"../dist","assets")],{root:path.resolve(self.__env.cwd,"../")}));
         __config.plugins.push(new ExtractTextPlugin('css/[name].bundle.css'));

         __config.plugins.push(new this._webpack.optimize.CommonsChunkPlugin({
             names:['common'], // 注意不要.js后缀
             filename:'js/[name].bundle.js',
             minChunks:'Infinity'
         }));

         __config.externals = [];

         __config["output"] = {
             path:path.join(self.__env.cwd,"../dist","assets"),
             filename:'js/[name].bundle.js'
         }
         self._config.push(Object.assign({},__config));
    }


    /**
     * 根据项目的约定目录结构生成webpack配置项-多目录多页面
     */
    multiDirectoryConfig(){
        var self = this;
        self.commonConfig();
        let files = [];
        if(this.__args["dir"] && (this.options.start == "start" || this.options.start == "release")){ //针对指定目录编译
            files = fileUtil.forEachFile(path.resolve(this.__env.cwd,this.__args["dir"]));
        }else{ //编译整个项目
            files = fileUtil.forEachFile(this.__env.cwd);
        }

        var __config;
        files.forEach(function (items) {
            __config = Object.assign({},webpackBaseConfig(self.__env));
            // __config["context"] = self.__env.cwd;
            var entryName = self.getEntryKey(items.modulePath,items.name);
            var xx = {};
            xx[entryName] = items.jsPath;
            __config.entry = xx;
            __config.plugins.push(new HtmlWebpackPlugin({
                filename:items.filename,
                inject:true,
                template:self.clearRoot(items.html),
                chunks:[entryName]
            }));


            var rp = items.modulePath.replace(self.__env.cwd,"");
            rp=rp.replace(/^[\\\/]|[\\\/]$/gi,"");
            __config["output"] = {
                publicPath:rp,
                path:path.resolve(self.__env.cwd,"../dist",rp),
                filename:'assets/js/[name]-[chunkhash].bundle.js'
            }

            __config.plugins.push(new ExtractTextPlugin('assets/css/[name].style.css'));
            __config.plugins.push( new CleanWebpackPlugin([path.resolve(self.__env.cwd,'../dist',rp)],{root:path.resolve(self.__env.cwd,'../')}));

            self._config.push(Object.assign({},__config));
        });
    }

    multiDirectory(){
        var self = this;
        self.commonConfig();
        let files = [];
        if(this.__args["dir"] && (this.options.start == "start" || this.options.start == "release")){ //针对指定目录编译
            files = fileUtil.forEachFile(path.resolve(this.__env.cwd,this.__args["dir"]));
        }else{ //编译整个项目
            files = fileUtil.forEachFile(this.__env.cwd);
        }

        var __config = Object.assign({},webpackBaseConfig(self.__env));
        __config["output"] = {
            publicPath:"",
            path:path.resolve(self.__env.cwd,"../dist"),
            filename:'[name]-[chunkhash].bundle.js'
        }

        files.forEach(function (items) {

            var rp = items.modulePath.replace(self.__env.cwd,"");
            rp=rp.replace(/^[\\\/]|[\\\/]$/gi,"");

            var entryName = rp+"/assets/js/"+items.name;
            entryName = entryName.replace(/^[\\\/]|[\\\/]$/gi,"");
            var xx = {};
            xx[entryName] = items.jsPath;
            __config.entry = Object.assign(__config.entry,xx);

            var outFileName = rp+"/"+items.filename;
            outFileName=outFileName.replace(/^[\\\/]|[\\\/]$/gi,"");
            __config.plugins.push(new HtmlWebpackPlugin({
                filename:outFileName,
                inject:true,
                template:self.clearRoot(items.html),
                chunks:[entryName]
            }));

            __config.plugins.push(new ExtractTextPlugin({
                filename:function (getPath) {
                    return getPath("[name].style-[contenthash].css").replace("/js/","/css/");
                }
            }));
            __config.plugins.push( new CleanWebpackPlugin([path.resolve(self.__env.cwd,'../dist',rp)],{root:path.resolve(self.__env.cwd,'../')}));
        });
        // console.log(":::::::::::::::",__config);
        self._config.push(Object.assign({},__config));
    }


    listen(compiler,port){
        var self = this;

        if(this.__server == null){
            this.__server = new webpackDevServer(compiler,{
                contentBase:path.join(self.__env.cwd,"dist"),
                hot:true,
                progress:true,
                clientLogLevel:"error",
                stats:"errors-only"
            }).listen(port,self.projectConfig.server.host,function () {

                var url = self.projectConfig.server.host+":"+self.projectConfig.server.port;
                open("http://"+url, {}).catch(() => {});
            });
        }
    }
    /**
     * 执行webpack 打包编译
     */
    execute(){
        var self = this;
        // console.log(self._config);
        let compiler = this._webpack(this._config);
        compiler.plugin("done",function () {
            console.warn("己编译完成");});
        //编译与打开页面 热更新
        if(self.options.start == "start"){
            self.listen(compiler,self.projectConfig.server.port);
        }

        // 只是编译
        if(self.options.start == "release"){
            compiler.run(function () {});
        }

    }

}
module.exports = FowWebpack;