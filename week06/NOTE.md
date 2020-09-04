学习笔记

## CSS排版

### 盒

填空题：

```text
HTML代码中可以书写开始__标签__，结束__标签__ ，和自封闭__标签__ 。

一对起止__标签__ ，表示一个__元素__ 。

DOM树中存储的是__元素__和其它类型的节点（Node）。

CSS选择器选中的是__元素__ 。

CSS选择器选中的__元素__ ，在排版时可能产生多个__盒__ 。

排版和渲染的基本单位是__盒__ 。
```

关系到盒模型的CSS属性
- margin
- border
- padding
- height
- width
- box-sizing

box-sizing: content-box是默认值，表示width是盒子内容content的宽度，而border-box更符合人的直觉，width包括border,padding,content三部分

标签可以理解成文法，元素可以理解成 html 渲染运行时的一个对象实例，盒子就是渲染过程的一个抽象模型

### 正常流

正常流的计算顺序：
- 收集盒和文字进行（line-box）
- 计算盒和文字在行中的排布
- 计算行的排布

inline-level-box：行内级别的盒

line-box：由inline-level-box和文字构成的盒子
block-level-box：块级别的盒子

line-box和block-level-box是从上到下的排布顺序，称为BFC (block-level-formatting-context)

line-box内部是从左到右的排布顺序，称为IFC (inline-level-formatting-context)

### 正常流的行级排布

#### 行的排布

![image](https://static001.geekbang.org/resource/image/aa/e3/aa6611b00f71f606493f165294410ee3.png)

相关概念：
基线baseline：对齐英文的基准线
text-bottom，text-top：文字顶部底部，由fontSize最大的字决定
line-bottom，line-top：行顶部底部

行内默认是baseline对齐，如果行里面某个盒子有多行文本，则按最下层一行的文本对齐

### 正常流的块级排布

#### float和clear
float会压缩行盒子尺寸，影响行的范围是float元素自身高度内，多个float堆叠可能会发生

使用clear属性，找到干净的行空间做浮动排版

margin堆叠：只会发生在正常流的BFC中

> https://developer.mozilla.org/zh-CN/docs/Web/CSS/clear

### BFC合并

**Block Container：里面包含BFC，能容纳正常流的盒里面就有BFC**

Block Container有关的值
- display: block
- display: inline-block
- display: table-cell
- display: table-caption
- flex item
- grid cell

**Block-level Box：外面有BFC的**

Block-level Box有关的值
- display: flex
- display: table
- display: grid
- ...

**Block Box = Block Container + Block-level Box，里外都有BFC**

#### 设立BFC的条件
- float != none
- position:absolute/fixed的元素
- Block Container：display 为 inline-block | table-cell | table-caption | flex | inline-flex | grid cell
- overflow != visible的Block Box

#### BFC合并

++自身为块级，且 overflow 为 visible 的块级元素容器++，它的块级格式化上下文和外部的块级格式化上下文发生了融合，也就是说，如果不考虑盒模型相关的属性，这样的元素从排版的角度就好像根本不存在。

BFC合并之后：
- float会影响行盒，比如文字环绕
- margin collapse现象

```html
<!-- example
1. div.a div具有浮动属性属于Block Container
2. 父元素div.a的display=block也是属于Block Container
3. 所以div.a div内外都是BFC，出现合并现象
-->
<style type="text/css">
  div.a {
    width: 300px;
    background-color: pink;
    outline: 1px dashed red;
    /*display: inline-block;*/
    /*overflow: auto;*/
  }

  div.a div {
    width: 100px;
    height: 100px;
    background-color: #dcdcdc;
    margin: 5px;
    float: left;
  }
</style>
<div class="a">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  text
</div>
```

### Flex排版

排版的过程：
- 收集盒进行
- 计算盒在主轴方向的排布
- 计算盒在交叉轴方向的排布

要点：
- 行盒先计算非flex元素占用的宽度，再把剩下的宽度按比例分配宽度给flex元素
- 行盒剩下的宽度如果是负数，flex元素宽度是0，而其他元素宽度按比例压缩
- flex-wrap: no-wrap的元素会被强制分进第一行
- 行高由行最高的一个元素决定，具体位置由flex-align/item-align属性决定

## CSS动画与绘制

### CSS动画

#### Animation
使用`@keyframes`声明动画，from和to等同0%和100%，通过`animation`属性使用动画
```css
@keyframes mykf
{
  from { background: red;}
  to   { background: yellow;}
}
div { animation: mykf 5s 1s infinite; }
```

`animation`是一个简写的属性，包含

- animation-name 时间曲线
- animation-duration 动画的时长;
- animation-timing-function 动画的时间曲线;
- animation-delay 动画开始前的延迟;
- animation-iteration-count 动画的播放次数;
- animation-direction 动画的方向

keyframes的声明：使用百分比或from/to关键字表示关键帧的属性

> 在keyframes里使用transition可以使用不同的timing-function

#### Transition

直接使用`transition`属性，不需要@rule声明

`transition`是一个简写的属性，包含：

- transition-property 要变换的属性;
- transition-duration 变换的时长;
- transition-timing-function 时间曲线;
- transition-delay 延迟。

#### Timing Function 时间曲线

CSS的timing-function都是三次贝塞尔曲线

贝塞尔曲线是一种插值曲线，它描述了两个点之间差值来形成连续的曲线形状的规则。

- ease：从慢到快再到慢
- ease-in：从慢到快
- ease-out：从快到慢
- ease-in-out：相似ease，但是速度差别更小
- linear：线性动画，速度恒定

### 颜色

**浏览器的默认颜色空间是基于sRGB的（图片/视频是特例）**

CSS3 可以使用这些颜色模型表示颜色
- RGB，RGBA
- HSL，HSLA

HSL是色相（Hue）、饱和度（Saturation）和明亮度（Lightness）这三个颜色属性的简称

> https://www.w3.org/TR/css-color-3/

### 绘制

影响绘制的属性

- 几何图形
  - border
  - box-shadow
  - border-radius
- 文字
  - font
  - text-decoration
- 位图
  - background-image