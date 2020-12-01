学习笔记

## 单元测试工具mocha

[mocha](https://mochajs.org/) 是一个javascript程序的测试框架，最早用于nodejs模块的测试，但是nodejs对于前端常用的ES modules的方式是默认不支持的。

**编写测试代码**
```javascript
//test/add.js
let assert = require("assert");
let { add } = require("../add");
describe("add函数测试", function () {
  it("1+2=3", async function () {
    assert.strictEqual(add(1, 2), 3);
  });
});

//------------------------------------
//add.js
function add(a,b){
  return a+b;
}
module.exports  = {add};
```

这里例子里面用了CommonJS的模块形式，为了支持ES modules的形式，可以使用[`@babel/register`](https://babeljs.io/docs/en/babel-register)模块：

**安装**
```bash
npm install @babel/core @babel/preset-env @babel/register --save-dev
#执行测试
./node_modules/.bin/mocha --require "@babel/register"
```

**配置 babel**
```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "esmodules": true
        }
      }
    ]
  ]
}
```

或者在`package.json`的`scripts`字段增加：`"mocha": "mocha --require \"@babel/register\""`，通过`npm run mocha`命令可以自动调用项目中依赖的mocha。


## 单元测试工具 | code coverage


[nyc](https://github.com/istanbuljs/nyc) 是 [istanbuljs](https://istanbul.js.org/) 的cli工具。

**安装：**
```
npm install --save-dev nyc
```

**加上bael的支持：**

> https://istanbul.js.org/docs/tutorials/es2015/
>
> https://github.com/bcoe/es2015-coverage
>
> https://www.npmjs.com/package/@istanbuljs/nyc-config-babel
>
> https://github.com/istanbuljs/babel-plugin-istanbul

1. 安装插件：
```bash
npm install --save-dev babel-plugin-istanbul @istanbuljs/nyc-config-babel
```

2. 编辑文件`.nycrc`：

```json
{
    "extends": "@istanbuljs/nyc-config-babel"
}
```

3. 更新 babel 的配置：
```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": { "esmodules": true }
      }
    ]
  ],
  "plugins": ["istanbul"],
  "sourceMaps": "inline"
}
```

4. 添加`package.json`的script：
```text
"nyc": "nyc mocha --require @babel/register"
```

5. 运行 nyc ，查看命令行结果是否提示错误和测试代码的覆盖率情况。

添加babel的支持后完善测试用例，尽量取得更高的覆盖率。

## 所有工具与generator的集成

把这周的测试框架集成到`generator-vue`项目里，照葫芦画瓢就行了。