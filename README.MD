Fow.js
======
FowIeJs 是一个集成webpack解决方案,[支持多页面多模块开发方式，目前己集成React](http://react-ie8.xcatliu.com),jQuery,zeptojs等常用开发库。此解决方案支持
ie8及以上的浏览器版本。

### ES6或JSX代码转码
```
rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react'],
                    }
                },
                exclude: /node_modules/
            }
        ]
```
- babel-loader: babel加载器
- babel-preset-react: jsx 转换成js

## 全局命令行安装
```
//fow-ie.js文件开头必须有以下代码
#!/usr/bin/env node
```

## 问题解决
#### Babel 在当前项目目录中没有安装时找不到presets的node module时的配置修改
```
options:{
  presets: [ 'env', 'react' ]
}

//修改为
 options:{
 presets: [ 'babel-preset-env', 'babel-preset-react' ].map(require.resolve)
 }
```

