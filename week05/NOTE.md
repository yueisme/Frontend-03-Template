## CSS的语法

标准文档

> CSS2.1：https://www.w3.org/TR/CSS21/grammar.html#q25.0
>
> CSS3：https://www.w3.org/TR/css-syntax-3
>
> CSS所有标准：https://www.w3.org/TR/?tag=css
>
> https://www.w3.org/Style/CSS/current-work

CSS语法结构：
- @charset
- @import
- rules
  - @media
  - @page
  - rule普通规则

### at-rules
- @charset ： https://www.w3.org/TR/css-syntax-3/
- @import ：https://www.w3.org/TR/css-cascade-4/
- @media ：https://www.w3.org/TR/css3-conditional/
- @page ： https://www.w3.org/TR/css-page-3/
- @counter-style ：https://www.w3.org/TR/css-counter-styles-3
- @keyframes ：https://www.w3.org/TR/css-animations-1/
- @fontface ：https://www.w3.org/TR/css-fonts-3/
- @supports ：https://www.w3.org/TR/css3-conditional/
- @namespace ：https://www.w3.org/TR/css-namespaces-3/

### rules

普通规则包含seletor和declaration

##### 选择器seletor的产生式

> https://www.w3.org/TR/selectors-3/#selectors

```text
/* 选择器列表，可以书写若干selector，使用英文逗号`,`分隔 */
selectors_group
  : selector [ COMMA S* selector ]*
  ;

/* 复杂选择器，由若干个simple_selector_sequence和combinator组合而成 */
selector
  : simple_selector_sequence [ combinator simple_selector_sequence ]*
  ;

combinator
  /* combinators can be surrounded by whitespace */
  : PLUS S* | GREATER S* | TILDE S* | S+
  ;

/* 简单选择器和复合选择器， 复合选择器由多个简单选择器连续书写组成 */
simple_selector_sequence
  : [ type_selector | universal ]
    [ HASH | class | attrib | pseudo | negation ]*
  | [ HASH | class | attrib | pseudo | negation ]+
  ;
```

##### 声明declaration

属性和值组成一个声明，属性可以是：CSS的Property或者变量，Property来自不同的CSS标准。
```text
declaration
  : property ':' S* expr prio?
```

**CSS Properties：**

https://www.w3.org/Style/CSS/all-properties

https://www.w3.org/Style/CSS/all-descriptors

**CSS Variables 变量：**

https://www.w3.org/TR/css-variables/

**CSS extensions 浏览器特有属性：**
- Mozilla CSS extensions (prefixed with -moz)
- WebKit CSS extensions (mostly prefixed with -webkit)
- Microsoft CSS extensions (prefixed with -ms)

**值和单位：**

> https://www.w3.org/TR/css-values-3/

CSS 属性值可能是以下类型：

- CSS 范围的关键字：initial，unset，inherit，任何属性都可以的关键字。
- 字符串：比如 content 属性。
- URL：使用 url() 函数的 URL 值。
- 整数 / 实数：比如 flex 属性。
- 维度：单位的整数 / 实数，比如 width 属性。
- 百分比：大部分维度都支持。
- 颜色：比如 background-color 属性。
- 图片：比如 background-image 属性。
- 2D 位置：比如 background-position 属性。
- 函数：来自函数的值，比如 transform 属性。

## 选择器


### 选择器类型和语法

**简单选择器**：

- type 类型选择器
- `*` 全体选择器
- `#HASH` ID选择器
- `.class` class选择器
- `[attrib]` html属性
- `:pseudo-classes` 伪类
- `::pseudo-elements` 伪元素

##### 选择器的命名空间：

svg 和 HTML 中都有 a 元素，我们若要想区分选择 svg 中的 a 和 HTML 中的 a，就必须用带命名空间的类型选择器。

**类型选择器，全体选择器，属性选择器都可以使用命名空间。使用方法是在选择器前书写`ns|`**

```css
@namespace svg url('http://www.w3.org/2000/svg');
@namespace html url('http://www.w3.org/1999/xhtml');

/* 声明之后可以区分svg还是html */
svg|a  { stroke: red; stroke-width: 1; }
html|a { font-size: 200%; }
a      { font-style: italic; }
```

**复合选择器**

- <简单选择器><简单选择器><简单选择器>
- `*` 或者 `div` 必须写在最前面

**复杂选择器**

- <复合选择器><sp><复合选择器>
- <复合选择器>">"<复合选择器>
- <复合选择器>"~"<复合选择器>
- <复合选择器>"+"<复合选择器>
- <复合选择器>"||"<复合选择器>

**选择器组**

同时书写不同的复杂选择器、复合选择器、简单选择器并且用逗号分隔开

### CSS属性优先级

统计选择器数量，按不同权重乘上数字，数字越大优先级越高

权重从大到小排列：
- 行内样式
- ID 选择器
- class 选择器，属性选择器，伪类选择器
- 类型选择器，伪元素选择器
- 通用选择器`*`

特例：带有`!important`的属性会高于任何普通形式的声明。

> https://www.w3.org/TR/selectors-3/#specificity
> 
> https://www.w3.org/TR/2011/REC-CSS2-20110607/cascade.html#specificity

### 伪类

链接/行为
- :any-link
- :link， :visited
- :hover
- :active
- :focus
- :target

树结构
- :empty
- :nth-child()
- :nth-last-child()
- :first-child， :last-child， :only-child

*谨慎使用破坏回溯原则的伪类，比如:nth-last-child。*

逻辑型
- :not伪类
- :where， :has

### 伪元素
- ::before
- ::after
- ::first-line
- ::first-letter

`::first-line` `::first-letter`的选择器内的属性使用有限制。

`::first-letter`支持的属性
- font properties
- color property
- background properties
- ‘word-spacing’
- ‘letter-spacing’
- ‘text-decoration’
- ‘vertical-align’ (only if ‘float’ is ‘none’)
- ‘text-transform’
- ‘line-height’
- ‘float’
- margin properties
- padding properties
- border properties


`::first-line`支持的属性
- font properties
- color property
- background properties
- ‘word-spacing’
- ‘letter-spacing’
- ‘text-decoration’
- ‘vertical-align’
- ‘text-transform’
- ‘line-height’
