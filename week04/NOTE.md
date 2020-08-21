学习笔记：这周的课程比较抽象而且视频内容有些生硬

## 排版layout

#### 根据浏览器属性进行排版

通过上一周的编码，我们已经可以得到带CSS的DOM树，这一步我们需要通过计算排版，得出带位置的DOM树

排版方式的演变过程：正常流，flex，grid，css houdini

**flex排版的一些概念：**
- **主轴**：纵向/横向排版中存在一个方向，指向元素排布顺序，这就是主轴方向
- **交叉轴**：与主轴相互垂直的方向的轴
- flex-direction决定主轴方向

> https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Using_CSS_flexible_boxes

**使toy-broswer支持flex排版：**

toy-broswer的flex排版需要知道子元素，所以把layout放在endTag的时候进行

这一课做了预处理的工作：确定主轴交叉轴用到的宽高参数，确定排版顺序

#### 收集元素进行

- 收集父元素的mainSize尺寸，如果未指定视为auto处理，设为子元素尺寸的总和
- 根据主轴尺寸，把元素分行
- flex-wrap:nowrap全部塞到一行里面

一些参数的抽象：
```javascript
//主轴相关
let mainSize //主轴方向的尺寸，比如width/height
, mainStart  //主轴起始属性，用于定位
, mainEnd    //主轴结束属性，用于定位
, mainSign   //绘图顺序，+1表示正向，-1反向
, mainBase;  //绘图起始坐标

let mainSpace；//主轴剩余尺寸


//交叉轴相关
let crossSize //交叉轴方向的尺寸
, crossStart  //交叉轴起始属性，用于定位
, crossEnd    //交叉轴结束属性，用于定位
, crossSign   //绘图顺序，+1表示正向，-1反向
, crossBase;  //绘图起始坐标

let crossSpace;；//交叉轴剩余尺寸
```

#### 计算主轴

- 找出所有Flex元素
- 把主轴方向的剩余尺寸按比例分配给这些Flex元素
- 若剩余空间为负数，所有flex元素为0，等比压缩剩余元素
- 循环所有行，为每个元素增加主轴的坐标：mainStart，mainEnd，mainSize

#### 计算交叉轴
- 算出交叉轴高度：如果是auto，把每行的crossSize相加否则使用元素css声明的尺寸
- 计算crossBase和step
- 循环所有行，为每个元素增加交叉轴的坐标：crossStart，crossEnd，crossSize


## 渲染render

经过上面步骤的计算，可以得出一个元素在绘制中的位置(left/top)，尺寸(width,height)。

这四个参数可以在一个二维的平面图中确定一个矩形，由此我们可以做最基本的绘制了。

使用绘图库(npm:images)准备一个画布，再递归我们最终的DOM树，把元素绘制到图形中的位置，提取出`background-color`的属性填充颜色方便观察，就可以查看效果了。
