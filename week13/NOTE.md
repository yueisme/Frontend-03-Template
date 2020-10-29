学习笔记

### 组件的基本概念和基本组成部分

基本概念

组件和模块、对象的区别：

组件与UI强相关，可以是特殊的对象或模块，可以以树形结构组合，具有模板化配置能力。

对象的三大要素：
- 属性 Properties
- 方法 Methods
- 继承关系 Inherit

组件的要素：
- 属性 Properties
- 方法 Methods
- 继承关系 Inherit
- 标记属性 Attribute
- 配置 Config & 状态 State
- 事件 Event
- 生命周期 Lifecycle
- 树形结构后代 Children

**Attribute 和 Property 区别**
- 是否相同取决于组件的设计。
- Attribute 强调描述性，来源于标记型语言。
- Property 强调从属关系，来源于面向对象。
- HTML标签的 attribute 都是字符串，和 property 会互相影响。
- 在input元素中的`value` property 优先于 attribute。

**生命周期**

我理解为一些特殊的时间点发生的事件，能够给使用者和用户影响组件，所有这些加在一起就是生命周期的过程。

**Children**

Content 类型：常用的类型

Template 类型：充当模板的作用，不能反映实际的children的数量，由外部决定


### 为组件添加JSX语法

运行环境和版本：
```text
npm: 7.0.3
node: 12.18.2
yarn: v1.22.10
webpack-cli: 4.1.0
webpack: 5.1.3
```

```bash
#全局安装webpack
npm install -g webpack webpack-cli

#准备工程环境
mkdir jsx-component
cd jsx-component
npm init
touch main.js

#开发环境webpack
npm install --save-dev webpack webpack-cli webpack-dev-server

#babel相关
npm install --save-dev babel-loader @babel/core @babel/preset-env

#jsx
npm install --save-dev @babel/plugin-transform-react-jsx
```

创建`webpack.config.js`
```javascript
module.exports = {
  mode: "development",
  devtool: 'source-map',

  //入口文件
  entry: "./main.js",

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            // 指定"pragma"选项替换默认的"React.creatElement
            plugins: [
              ["@babel/plugin-transform-react-jsx", { pragma: "creatElement" }],
            ],
          },
        },
      },
    ],
  },
};

```

### JSX的基本使用方法

实现creatElement函数：
```javascript
//main.js
function createElement(type, attributes, ...children) {
  //如果type是大写字母开头会转换成class组件
  return;
}
```

### 轮播组件

#### 布局设定

轮播组件内的图片元素使用横向排布：
```css
.carousel{
  width: 500px;
  height: 300px;
  overflow: hidden;
  white-space: nowrap; /*使得行盒不换行*/
}

.carousel>div{
  width: 100%;
  height: 100%;
  display: inline-block; /* 横排 */
  transition: ease 0.5s;
  background-size: 100% 100%;
}
```

#### 定时器自动轮播
使用JS定时修改图片元素的`transform: translateX()`属性，配合`transition`属性产生滚动的动画效果。

获取下一张轮播图片index的取值技巧：
```
let nextIndex = (this.currentIndex + 1) % children.length;
```

实现无限向后滚动：
取出下一张图片挪到当前图片的旁边位置：
```javascript
//取消动画否则会有视觉bug
next.style.transition = "none";
next.style.transform = `translateX(${100 - nextIndex * 100}%)`;
//等待一帧的时间让图片挪动完成
setTimeout(() => {
  next.style.transition = "";
  //使当前图片移出，下一张图片移入
  current.style.transform = `translateX(${-100 - this.currentIndex * 100}%)`;
  next.style.transform = `translateX(${-1 * nextIndex * 100}%)`;
  this.currentIndex = nextIndex;
}, 16);
```

#### 支持鼠标拖动轮播图

设置鼠标事件的技巧可以参考12周课程普通拖拽部分。

**mousemove事件**：

改变图片的`transform: translateX()`属性，使图片可以移动，


**mouseup事件**：

确定鼠标释放时的图片位置：
```javascript
let x = moveEvent.clientX - startX;
this.position = this.position - Math.round(upX / this.width);
```