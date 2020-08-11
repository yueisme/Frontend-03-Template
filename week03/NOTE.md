学习笔记

## 作业
- [x] 网站的练习(dom树和css)
- [x] specificity函数的selectorParts解析复合选择器
- [x] （可选）实现复合选择器 `div.text#id1`
- [x] （可选）支持空格的多个class选择器 `<div id="id1" class="text class2">`
- [x] （额外）实现通用选择器`*`
- [x] （额外）修正了css存在注释时会报错的问题

github toy-broswer-html-parser的代码是html到dom树部分，toy-broswer-css-computing的代码是余下的css部分

## 实现HTML parse

#### 第一步：准备

创建一个html parser到单独的文件中，parser接受html全文进行工作。

#### 第二步：词法和状态机逻辑

确定一个html标准，tokenization章节描述了状态机解析html词法的思路。 https://html.spec.whatwg.org/multipage/parsing.html#tokenization 

用FSM有限状态机实现分析，设计了一个Symbol('EOF')作为状态机的最后输入，以此表示html截止。

#### 第三步：状态机流程

使用状态机区分起始标签，结束标签，自封闭标签。实现了基本的标签之间状态迁移。

本节使用到的状态机：
- data
- tagOpen
- endTagOpen
- tagName
- beforeAttributeName
- selfClosingStartTag

#### 第四步：解析标签

为状态机加入计算逻辑，实现标签名的解析。加入了emitToken过程，能实现获取标签的完整名称和区分开始/结束。

#### 第五步：解析标签属性

支持标签属性attribute三种写法的的解析：单引号、双引号、无引号。

本节新加入的状态机：
- attributeName
- beforeAttributeValue
- doubleQuotedAttributeValue
- singleQuotedAttributeValue
- UnquotedAttributeValue
- afterAttributeName
- afterQuotedAttributeValue

#### 第六步：树结构

实现DOM树结构，完善了emitToken过程，关键思路：
- 从标签构建DOM树的基本技巧是使用栈
- 遇到开始标签时创建元素并入栈，遇到结束标签时出栈
- 自封闭节点可视为入栈后立刻出栈
- 任何元素的父元素是它入栈前的栈顶

参考资料：
> Tree construction章节：https://html.spec.whatwg.org/multipage/parsing.html#tree-construction

#### 第七步：补充文本节点

补充DOM树结构的逻辑，emitToken过程支持连续的文本节点进行合并，支持文本节点进入栈

## CSS计算

#### CSS parser和收集规则

html parser遇到style标签时，取出里面的文本进行CSS的语法和词法分析，css parser使用npm的css包实现：https://www.npmjs.com/package/css 

css parser返回的对象里面可以得出我们的selector和对应的css规则，收集规则保存到全局对象内。

#### 添加调用

emitToken过程的startTag步骤，我们会插入一次computeCSS处理，用来匹配element的CSS

#### 获取父元素序列

在computeCss函数中，我们必须知道元素的所有父元素才能判 断元素与规则是否匹配。

在computeCss时，把当前栈做一次复制，由此可知当前元素的父元素，并且按从内向外的顺序匹配规则。

#### 选择器与元素的匹配

修改computeCss，实现简单选择器和复杂选择器的空格语法做匹配，使用双重循环的方法去做规则匹配，匹配的逻辑这节暂不实现。

- 第一层循环所有css规则，取出selector name检查基本匹配
- 第二层循环栈快照，检查父元素的匹配，通过使用计数器比对selector的父元素数量确定

#### 计算选择器与元素匹配

实现匹配match的逻辑，支持.class #id tagname，主要做一些字符串的检查。使用正则`/[a-zA-Z0-9]+|\.[a-zA-Z0-9]+|#[a-zA-Z0-9]+/g`实现符合选择器的处理

#### 生成computed属性

修改computeCss，补充dom元素的computed属性，从rule.declarations获得。

#### specificity的计算逻辑

实现选择器的优先级。

- CSS规则根据specificity和后来优先规则覆盖
- specificity是个四元组，越左边权重越高
- 一个CSS规则的specificity根据包含的简单选择器相加而成

四元组规则：inline > id > class > tag


扩展资料：
- https://www.w3.org/TR/selectors-3/#specificity
- https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity
