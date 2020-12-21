学习笔记

## 初始化工具Yeoman
[Yeoman](https://yeoman.io/)是一个创建脚手架的工具，通过`generator`来快速生成一个基本项目模板

#### 安装和配置
Yeoman强制规范了文件夹的命名需要以`generator-*`的格式
```bash
npm install -g yo
mkdir generator-toolchain
cd generator-toolchain
npm init
npm install yeoman-generator
```

#### 编写generator

> https://yeoman.io/authoring/index.html
>
> API: https://yeoman.github.io/generator/

```bash
cd generator-toolchain
#修改 package.json 的 "main" 字段，指向 generators/app/index.js
npm link #使模块link到全局中方便yo命令查找
mkdir -p generators/app
touch generators/app/index.js
```

generator的代码将会按照书写的顺序从上往下执行


**代码示例：**
```javascript
//generators/app/index.js
var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }

  async job1() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      },
    ]);
    //空格转横线
    answers.name = answers.name.replace(/\s+/g, '-');
    this.config.set('answers',answers);
  }

  job2() {
    this.log(this.config.getAll());
  }
};

```

#### Yeoman generator的项目结构

```text
generator-vue/
├── generators/
│   ├── app/
│   │   ├── index.js
│   │   └── templates/
│   │       ├── HelloWorld.vue
│   │       ├── babel.config.json
│   │       ├── index.html
│   │       ├── main.js
│   │       └── webpack.config.js
│   └── router/
├── package-lock.json
└── package.json
```

`generators/app/templates`里面放置项目的代码模板文件

#### 编写vue项目的generator

创建vue代码和webpack.config.js：
- 引入webpack和vue相关的loader：`vue-loader`, `vue-style-loader`
- 编写vue项目并试着用webpack打包

> https://vue-loader.vuejs.org/zh/guide/#webpack-%E9%85%8D%E7%BD%AE

编写generator代码：
```
//创建package.json和默认字段
const pkgJson = {
  "name": this.config.get('answers').name,
  "main": "main.js",
};
this.fs.extendJSON(this.destinationPath('package.json'), {"name": "project-vue", "main": "main.js",}});

//通过npm安装vue
this.npmInstall(['vue@2']);

//安装其他devDependencies依赖模块
this.npmInstall([
  "webpack", 
  "webpack-cli",
  "vue-loader", 
  "vue-style-loader", 
  "css-loader",
  "vue-template-compiler",
  "copy-webpack-plugin",
  "babel-loader",
  "@babel/core",
  "@babel/preset-env",
], { "save-dev": true});
```

## webpack基本知识

[webpack](https://webpack.js.org/)是一个用于javascript程序的打包工具，能把项目代码打包集成到一个文件内。

> https://webpack.docschina.org/concepts/

**webpack@5 的全局安装：**
```bash
npm install -g webpack webpack-cli
#或者
npx webpack
```

**基本概念：**
- `entry`：程序的入口文件
- `output`：输出打包的结果
- `loader`：对js和json之外文件的支持转换为模块
- `plugin`：更广泛的概念，支持对打包过程的影响

**webpack 的配置文件示例：**
```javascript
//webpack.config.js
module.exports = {
  entry: "./src/main.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
    ],
  },
  plugins: [

  ],
};

```

## Babel基本知识
[babel](https://babeljs.io/)是一个javascript的转换工具，用于把javascript代码语法转换成更旧版本标准的语法，以便能够运行在旧版本的环境中。

**babel@7 的全局安装方式和使用**
```bash
npm install -g @babel/core @babel/cli

#转换代码到命令行显示
babel es2015.js
```

**常见的babel包：**
- `@babel/core`：babel核心，必备
- `@babel/preset-env`：最常用的一套preset合集，包含大部分新语法，babel通过preset知道需要转换什么语法
- `@babel/cli`：命令行工具
- `babel-loader`：用于webpack打包的loader

babel的配置文件`.babelrc`：
```json
{
  "presets": ["@babel/preset-env"]
}
```

> https://babeljs.io/docs/en/configuration
>
> https://babeljs.io/docs/en/config-files
>
> https://webpack.docschina.org/loaders/babel-loader/
>
> https://juejin.cn/post/6844903858632654856#heading-8
>
> https://github.com/jamiebuilds/babel-handbook/tree/master/translations/zh-Hans