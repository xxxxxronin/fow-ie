var handlebars = require('handlebars');
var fis=module.exports = function (name,packageJson) {
    var fis = require('fis3');
    fis.require.prefixes.unshift(name);
    fis.cli.name = name;
    fis.cli.info = require(packageJson);

    //******************************************************************************************************************************
    //******************************************************************************************************************************
    fis.hook('npm'); //这是在fis-config.js中配置 对node_moduels 板块的支持
    fis.match('**.handlebars', {
        rExt: '.js', // from .handlebars to .js 虽然源文件不需要编译，但是还是要转换为 .js 后缀
        // parser: fis.plugin('handlebars-3.x', {
        //     //fis-parser-handlebars-3.x option
        // }),
        isHtmlLike:true,
        release: true // handlebars 源文件不需要编译
    });

    //对handlebars的处理后置
    fis.on("standard:restore",function (message) {
        if(message.value.indexOf(".handlebars")>0 && message.type == "jsEmbed"){
            var content = message.ret.substr(1,message.ret.length);
            content = content.substr(0,content.length-1);
            content = content.replace(/\\r\\n/ig,'');
            content = content.replace(/\\n/ig,'');
            content = content.replace(/\\t/ig,'');
            content = content.replace(/\\"/ig,'"');
            content= handlebars.precompile(content, {filename:message.file.fullname});
            message.ret= 'Handlebars.template(' + content + ')';
        }
    });
    // 模块化设置
    // npm install [-g] fis3-hook-module
    // mode: 模块化类型(AMD,CDM, CommandJs)
    // baseUrl: 基础路径,模块路径均基于此路径（包括页面require路径）
    // paths: 配置别名,基于baseUrl
    fis.hook('commonjs', {});

    // sass到碗来
    fis.match('*.scss', {
        rExt: '.css',
        parser: fis.plugin('node-sass', {
            // options...
        })
    });
    //css auto prefix
    fis.match('*.{css,scss}', {
        postprocessor: fis.plugin("autoprefixer", {
            // https://github.com/ai/browserslist#queries
            "browsers": ['Firefox >= 50', 'Safari >= 6', 'Explorer >= 11', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
            "flexboxfixer": true,
            "gradientfixer": true
        })
    });

    // fis.match('/modules/**.{js,jsx}', {
    //     isMod: true
    // });

    fis.match('/node_modules/**.js', {
        isMod: true
    });

    // pages目录下的js文件均采用模块化包装
    // 自动包裹define
    // fis.match('/{ios, pages,product}/**.{js,jsx}', {
    //     isMod: true
    // });

    // 根据资源依赖表，加资源载到页面上
    // npm install -g fis3-postpackager-loader
    // 解析require需开启改插件,fis3 不在默认支持解析js中的require
    fis.match('::package', {
        postpackager: fis.plugin('loader', {
            allInOne: true  // 基于页面零散资源合并
        })
    });

    // 设置发布时不产出的文件
    fis.match('**.{txt,md}', {
        release: false
    });
    fis.match("/bin/**",{release:false})
    fis.match("/fisConfig/**",{release:false}).match("/fisconfig.js",{release:false});
    // 模块采用相对路径
    fis.hook('relative');
    fis.match('**', {relative: true});
    //******************************************************************************************************************************
    //******************************************************************************************************************************
    return fis;
}

