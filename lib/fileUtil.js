/**
 * Created by Administrator on 2017/7/5.
 */
var fs = require("fs");
var path = require("path");


function fileutil() {
    this.__ig = ["_template_def","_template_react","xxx","modules",".idea","static","aaa","demo","dist","css","assets","common"];
}

/**
 * 更新活动主目录
 */
fileutil.prototype.forEachDir = function (dirPath) {
    var self = this;
    var result = [];
    var files = fs.readdirSync(dirPath);
    files.forEach(function (filename) {
        // console.log(Array.contains(self.__ig,filename));

        if(self.__ig.indexOf(filename) == -1){
            var cPath = path.join(dirPath,filename);
            var info = fs.statSync(cPath);
            if(info.isDirectory()){
                var a =  self.forEachDir(cPath);
                result = result.concat(a);
            }
        }else{

        }
    });
    return result;
}

/**
 * 遍历目录和子目录下所有的.html,.js,.jsx文件
 * @param dirPath
 * @returns {Array}
 */
fileutil.prototype.forEachFile = function (dirPath) {
    var self = this;
    var result = [];
    var files = fs.readdirSync(dirPath);

    files.forEach(function (filename) {
        if(self.__ig.indexOf(filename) == -1){
            var cPath = path.join(dirPath,filename);
            var info = fs.statSync(cPath);

            if(info.isDirectory()){
                var a =  self.forEachFile(cPath);
                result = result.concat(a);
            }else{
                var ext = path.extname(cPath);

                var name = filename.replace(ext,"");
                var jsPath ="";
                var exts = [".js",".jsx",".ts"];
                for(var ixt in exts){
                    let pp = path.join(dirPath,name+exts[ixt]);
                    if(fs.existsSync(pp)){
                        jsPath = pp;
                        break;
                    }
                }

                //从js路径找
                if(jsPath.length<=0){
                    for(var ixt in exts){
                        let pp = path.join(dirPath,"js",name+exts[ixt]);
                        if(fs.existsSync(pp)){
                            jsPath = pp;
                            break;
                        }
                    }
                }

                if(filename.indexOf(".html") !=-1 && jsPath.length>0){
                    result.push({
                        html:cPath,
                        name:name,
                        ext:exts,
                        modulePath:dirPath,
                        jsPath:jsPath,
                        filename:filename
                    })
                }

            }
        }else{

        }
    });
    return result;
}

module.exports = new fileutil();
// var ff = new fileutil();
// console.log(ff.forEachFile("D:\\workspace\\activity\\src\\"));
// console.log(fs.existsSync("D:\\workspace\\activity\\src\\xx.xx"));