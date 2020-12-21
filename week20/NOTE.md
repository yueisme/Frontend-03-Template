学习笔记

### 持续集成 | 发布前检查的相关知识

持续集成是客户端开发中出现的一个模式，用来解决客户端build时间长的问题，包含两个概念：
- Daily Build 夜间进行的全量build
- Build Verifycation Test(BVT)：对build结果的简单验证

### 持续集成 | Git Hooks基本用法

```bash
mkdir git-demo
cd git-demo
#初始化git仓库
git init
#提交一个文件
touch README.md
git add .
git commit -a -m "init"
```

初始化git仓库后，可以看到`.git/hooks/`目录中有各种类型的hook sample文件，去掉`.sample`的后缀名就能创建hook了。在开发机本地主要是使用`pre-commit`和`pre-push`这两个钩子。

使用`pre-commit`钩子做lint工作
创建`pre-commit`钩子文件：
```bash
cd .git/hooks/
touch pre-commit
chmod +x pre-commit # 755
```

编辑内容：
```text
#!/usr/bin/env node
console.log('hook');
process.exit(1);
```
其中`process.exit(1);`给git返回退出信号为1，，非0的信号将会拒绝commit。

### 持续集成 | ESLint
[ESLint](https://eslint.org/) 是一个开源的 JavaScript 代码检查工具，由 Nicholas C. Zakas 于2013年6月创建。代码检查是一种静态的分析，常用于寻找有问题的模式或者代码，并且不依赖于具体的编码风格。

*以下基于eslint 7.15.0版本，nodejs v12*

##### 配置eslint：
```bash
npm install eslint --save-dev
#创建配置文件
npx eslint --init
#使用eslint检查文件
npx eslint index.js
```
> https://eslint.org/docs/user-guide/getting-started

##### 在git hooks中应用eslint
在前面课程我们把hook改成了使用nodejs执行，使得在hook里面使用eslint更方便：

```javascript
#!/usr/bin/env node
const { ESLint } = require("eslint");

(async function main() {
  // 1. Create an instance.
  const eslint = new ESLint();

  // 2. Lint files.
  const results = await eslint.lintFiles(["index.js"]);

  // 3. Format the results.
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  // 4. Output it.
  console.log(resultText);
})().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
```
> https://eslint.org/docs/developer-guide/nodejs-api

##### 暂存文件改动的项目
eslint在检查时，不会跳过对没有`git add`的文件做检查，这可能会出现不应该的报错阻止代码提交。借助`git statsh`命令可以暂存那些尚未完成的文件，让eslint不检查我们未add的项目。

```bash
#暂存到栈
git stash
#取出栈内的暂存到本地，并从栈中丢弃
git stash pop
```

> https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E8%B4%AE%E8%97%8F%E4%B8%8E%E6%B8%85%E7%90%86

```javascript
#!/usr/bin/env node
const { ESLint } = require("eslint");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

console.log(process.cwd());

(async function main() {
  // 1. Create an instance.
  const eslint = new ESLint({ fix: false });

  await execPromise("git stash push -k");

  // 2. Lint files.
  const results = await eslint.lintFiles(["*.js", "*.mjs"]);

  // 3. Format the results.
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  // 4. Output it.
  console.log(resultText);

  for (const iterator of results) {
    if (iterator.errorCount) {
      process.exitCode = 1;
    }
  }
})().catch((error) => {
  process.exitCode = 1;
  console.error(error);
}).finally(()=>{
  execPromise("git stash pop");
});
```


### 持续集成 | 使用无头浏览器检查DOM

Chrome浏览器的无头模式：https://developers.google.com/web/updates/2017/04/headless-chrome

```bash
alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
#打印dom
chrome --headless --disable-gpu --dump-dom "https://baidu.com"
```

#### 使用puppeteer

[Puppeteer](https://github.com/puppeteer/puppeteer) 是一个 Node 库，它提供了高级 API 来通过 DevTools 协议控制 Chromium 或 Chrome。Puppeteer 默认以 headless 模式运行，但是可以通过修改配置文件运行“有头”模式。

> https://github.com/puppeteer/puppeteer#resources

安装：
```bash
npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
npm install --save-dev puppeteer
```

例子：
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/main.html');
  const a  = await page.$('img');
  //await page.screenshot({path: 'example.png'});
  console.log(await a.asElement().boxModel());
  await browser.close();
})();
```
