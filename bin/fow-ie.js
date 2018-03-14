#!/usr/bin/env node
var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
const FowWebpack = require("../lib/fow-webpack");
var fileUtil = require('../lib/fileUtil');
const createFis = function (env,opts) {
   var  fis = require("../lib/fis-entry.js")("fow","../package.json");
    // 配置插件查找路径，优先查找本地项目里面的 node_modules
    // 然后才是全局环境下面安装的 fis3 目录里面的 node_modules
    fis.require.paths.unshift(path.join(env.cwd, 'node_modules'));
    fis.require.paths.push(path.join(path.dirname(__dirname), 'node_modules'));
    var moduleDirs = typeof opts.release == "string"?opts.release:"";
    if(opts.release == "all"){
         moduleDirs = fileUtil.forEachDir(env.cwd);
    }
    if(moduleDirs.isArray){
        fis.match(`/{${moduleDirs.join(",")}/**.{js,jsx}`, {isMod: true});
    }
    if(typeof moduleDirs == "string" && moduleDirs.length>0){
        env.cwd = path.join(env.cwd, moduleDirs);
        fis.match(`/{${moduleDirs}/**.{js,jsx}`, {isMod: true});
    }
    return fis;
}

var cli = new Liftoff({
    name: 'fowie', // 命令名字
    processTitle: 'fowie',
    moduleName: 'fowie',
    configName: 'fis-conf',
    // only js supported!
    extensions: {
        '.js': null
    }
});

cli.launch({
    cwd: argv.r || argv.root,
    configPath: argv.f || argv.file
}, function(env) {
    var fw = new FowWebpack(env,argv);
    fw.execute();
    // var type = argv.t || "fis";  //默认是fis3构建
    // var opts = argv["_"];
    // // console.log(opts);
    // // return;
    //
    // //初始化一个模块
    // if(opts[0] == "init"){
    //     console.log("this is init");
    //     console.log(env);
    //     return;
    // }
    // //运行模块
    // if(opts[0] == "run"){
    //     var fis  = createFis(env,argv);
    //     if(argv.w && argv.l){
    //         fis.cli.run({"_":["release"],"w":true,"l":true},env);
    //     }else{
    //         fis.cli.run({"_":["release"]},env);
    //         fis.cli.run({"_":["server","start"],"port":9081},env);
    //     }
    // }
    //
    // if(opts[0] == "stop"){
    //     var fis  = createFis(env,argv);
    //     fis.cli.run({"_":["server","stop"]},env);
    // }
    //
    // if(opts[0] == "open"){  //打开server 目录
    //     var fis  = createFis(env,argv);
    //     fis.cli.run({"_":["server","open"]},env);
    // }
    //
    // //发布模块
    // if(opts[0] == "release"){
    //     argv["release"] = opts[1];
    //     var fis  = createFis(env,argv);
    //     fis.cli.run({"_":["release"]},env);
    // }
});