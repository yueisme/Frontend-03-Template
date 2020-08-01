学习笔记

> 预习周的重学前端内容很多，一时间看的太多有些消化不过来。主要了解了js类型的一些细节和缺陷，对object有了更深刻的认识，意识到object属性也有区别。新开阔的Completion Record打开了引擎中会出现的规范类型这个知识点
> 
> 不理解的：
> 《7. JS结构化 | JS函数调用》这一课中的Execution Record讲解很生硬，是突然切入的主题，没有体会到跟前文有延续的感觉，所以最后也没明白是什么，它跟Execution Context是什么关系


### JS语言通识
语言分类：非形式语言（中文/英文），形式语言（常见于计算机编程）

乔姆斯基谱系：是计算机科学中刻画形式文法表达能力的一个分类谱系，是由诺姆·乔姆斯基于 1956 年提出的。它包括四个层次：
- 0型文法（无限制文法或短语结构文法）包括所有的文法。
- 1型文法（上下文相关文法）生成上下文相关语言。
- 2型文法（上下文无关文法）生成上下文无关语言。
- 3型文法（正规文法）生成正则语言。

文法是上下包含关系，编号大的属于编号小的子集

产生式(BNF)： 在计算机中指 Tiger 编译器将源程序经过词法分析（Lexical Analysis）和语法分析（Syntax Analysis）后得到的一系列符合文法规则（Backus-Naur Form，BNF）的语句

巴科斯诺尔范式：即巴科斯范式（英语：Backus Normal Form，缩写为 BNF）是一种用于表示上下文无关文法的语言，上下文无关文法描述了一类形式语言。

##### 语言的分类：

形式语言—按用途
- 数据描述语言:JSON, HTML, XAML, SQL, CSS
- 编程语言:C, C++, Java, C#, Python, Ruby, Perl,
Lisp, T-SQL, Clojure, Haskell, JavaScript

形式语言—按表达方式
- 声明式语言:JSON, HTML, XAML, SQL, CSS, Lisp, Clojure, Haskell
- 命令型语言:C, C++, Java, C#, Python, Ruby, Perl, JavaScript

JavaScript是运行在runtime中的动态语言

一般命令式编程语言的设计：

- Atom原子：变量名，直接量
- Expression表达式：Atom，Operator运算符，Punctuator标点符号
- Statement语句：Expression，Keyword关键字，Punctuator标点符号
- Structure结构：Function，Class，Process，Namespace，...
- Program程序：Program脚本，Module模块，Package，Library

### JS中的类型

> 在JS语法中属于Atom原子级别

**运行时中的类型：**
- Number
- String
- Boolean
- Object
- null 有值但是空，typeof === 'object'的缺陷
- undefined 没有值，可以用void 运算取得
- Symbol 可以索引Object，专门用于Object属性名
- BigInt

#### Number：

书写方式：十进制0、0.、.2 、1e3，二进制obxxx，八进制0oxxx，十六进制0xfF

IEEE 754双精度浮点标准，64位精度：符号位(1bit)表示正负，指数位(11bit)，有效位(52bit)。指数位第一位表示指数的正负，表示为有效位乘2的指数位次方

0.1 + 0.2 !== 0.3 的问题：精度表示的偏差，0.1/0.2/0.1+0.2/0.3在内存中不是精确的数字，所以会给出不相同的结果

语法冲突：0.toString和0 .toString()语法规则会把0.作为数字表示，toString会发生错误，可以在后面加空格，或者0..toString()

例外情况：
NaN，占用了 9007199254740990，这原本是符合 IEEE 规则的数字
Infinity，无穷大
-Infinity，负无穷大

编程中做除法运算要注意+0 和 -0的情况。`true === Number('-0') === Number('0') === Number('+0')`


#### String字符串：

书写方式：单引号，双引号，字符串模板`${exp}`

由Charater字符组成，字符是抽象的表达，需要结合字体成为实际的形象，计算机体系用code point表示字符。

码点（code point）是一个表示字符的数字，结合字符集对应到现实世界的文字

字符集：ASCII（最早的编码有127个字），Unicode，UCS，GB2312，GBK，GB18030，ISO-8859，BIG5

Unicode的编码方式：utf8，utf16

JS使用UTF16编码方式处理String

Unicode 的码点通常用 U+??? 来表示，其中 ??? 是十六进制的码点值。 0-65536（U+0000 - U+FFFF）的码点被称为基本字符区域（BMP）。处理非 BMP（超出 U+0000 - U+FFFF 范围）的字符时需要特别留意。

#### Object对象：

书写方式：

对象都是唯一的，与状态无关，用状态描述对象，状态改变成为行为

js的面向对象是基于原型prototype的，对象从属性和原型组成，属性也可以是函数，查找的属性如果对象自身不包含，会从原型一直向上查找，称为原型链

obejct属性用key-value表示，key类型是string和symbol，如果用symbol定义了属性，则必须用symbol去访问，value部分有数据类型和访问器类型。

JavaScript 对象的运行时是一个“属性的集合”，属性以字符串或者 Symbol 为 key，以数据属性特征值或者访问器属性特征值为 value

数据属性具有四个特征：
- value：就是属性的值。
- writable：决定属性能否被赋值。
- enumerable：决定 for in 能否枚举该属性。
- configurable：决定该属性能否被删除或者改变特征值。

访问器（getter/setter）属性四个特征：
- getter：函数或 undefined，在取属性值时被调用。
- setter：函数或 undefined，在设置属性值时被调用。
- enumerable：决定 for in 能否枚举该属性。
- configurable：决定该属性能否被删除或者改变特征值。

Object.defineProperty可以改变属性特征

Object.getOwnPropertyDescripter来查看数据属性


#### JavaScript 中的对象分类
我们可以把对象分成几类。

宿主对象（host Objects）：由 JavaScript 宿主环境提供的对象，它们的行为完全由宿主环境决定。

内置对象（Built-in Objects）：由 JavaScript 语言提供的对象。
- 固有对象（Intrinsic Objects ）：由标准规定，随着 JavaScript 运行时创建而自动创建的对象实例。
- 原生对象（Native Objects）：可以由用户通过 Array、RegExp 等内置构造器或者特殊语法创建的对象。
- 普通对象（Ordinary Objects）：由{}语法、Object 构造器或者 class 关键字定义类创建的对象，它能够被原型继承。

函数对象的定义是：具有[[call]]私有字段的对象，构造器对象的定义是：具有私有字段[[construct]]的对象。

function：typeof结果是function，它具有内置的一个[[call]]行为，任何宿主只要提供了“具有[[call]]私有字段的对象”，就可以被 JavaScript 函数调用语法支持。

#### 特殊对象
- Array：Array 的 length 属性根据最大的下标自动发生变化。
- Object.prototype：作为所有正常对象的默认原型，不能再给它设置原型了。
- String：为了支持下标运算，String 的正整数属性访问会去字符串里查找。
- Arguments：arguments 的非负整数型下标属性跟对应的变量联动。
- 模块的 namespace 对象：特殊的地方非常多，跟一般对象完全不一样，尽量只用于 import 吧。
- 类型数组和数组缓冲区：跟内存块相关联，下标运算比较特殊。
- bind 后的 function：跟原来的函数相关联。

### 表达式：
> 在JS语法中属于Expression表达式级别

##### 什么是表达式语句？

表达式语句实际上就是一个表达式，它是由运算符连接变量或者直接量构成的。
- PrimaryExpression 主要表达式
- MemberExpression 成员表达式
- NewExpression NEW 表达式
- CallExpression 函数调用表达式
- LeftHandSideExpression 左值表达式
- AssignmentExpression 赋值表达式
- Expression 表达式

#### 运算符：

左手表达式和右手表达式：能否放到等号左边，不能放在左边的一定是右手表达式

运算符按优先级：
- Member运算(left hand)：
```
a.b
a[b]
foo`string`
super.b
super['b']
new.target
new Foo()
```
- new运算(left hand)：
```
new Foo
```

- Call函数调用(left hand)：
```
foo()
super()
foo()['b'] //访问属性使得Member运算降级
foo().b
foo()`b`
```

- Update：
```
a++
a--
++a
--a
```

- Unary单目运算：
```
delete a.b
void xx
typeof a
+a
-a
~a
!a
await a
```

- Exponental乘方：
```
1 ** 1
```

- 其他：
```text
乘法*，除法/，取模%
加法+，减法-
位移运算：a << b，a >> b，a >>> b
关系比较表达式：<，>，<=，>=，instanceof，in
相等性判断：==，!=，===，!==
位运算：&，^，|
逻辑运算：&&，||
三目运算：condition ? ifTrue : ifFalse
赋值运算：x = y，x += y，x -= y，x *= y，x /= y，x %= y，x **= y，x <<= y，x >>= y，x >>>= y，x &= y，x ^= y，x |= y
```

Reference是标准类型，不是语言内的类型，delete/assign时会出现，Reference包含了object和key

#### 类型转换：
运算符两边类型不一样的时候，会出现类型转换（隐式）

a+b：某一边表达式出现字符串会尝试把另一边的表达式结果也转成字符串

==运算会尝试转换成数字相比较

a[b]会把key转换成string

##### 拆箱转换
object变量转换成基本类型的过程（ToPremitive）。优先会执行对象的Symbol.toPremitive方法，如果没有则会尝试执行toString（转string优先使用）或者valueOf（转number优先使用）

##### 装箱转换
基本类型变为object类的过程，在基本类型的member运算的时候会出现，比如`1.toString()`，可以通过typeof结果判断是否装箱`typeof (new Number(1)) === 'object'`


### 语句：
> 在JS语法中属于Statement语句

Completion Record是表示一个语句执行完之后的结果，它有三个字段：
- [[type]] type会根据语句决定，表示完成的类型，有 break continue return throw 和 normal 类型
- [[value]] 表示语句的返回值，如果语句没有，则是 empty；
- [[target]]：表示语句的目标，通常是一个 JavaScript 标签

#### 简单语句：
- ExpressionStatement：表达式语句，声明
- EmptyStatement：空语句（;）
- DebuggerStatement：debugger 语句
- ThrowStatement
- ContinueStatement
- BreakStatement
- ReturnStatement

#### 复合语句：
- BlockStatement：花括号{..}
- IfStatement：if判断
- SwitchStatement：switch判断
- IterationStatement：循环:for/while/do-while等
- WithStatement：with语句
- LabelledStatement：带label的语句
- TryStatement：try-catch

#### label的使用：
```
outer: while(true) {
  inner: while(true) {
      break outer;
  }
}
console.log("finished")
```
label与完成记录类型中的 target 相配合，用于跳出多层循环。
break/continue 语句如果后跟了关键字，会产生带 target 的Completion Record。一旦完成记录带了 target，那么只有拥有对应 label 的循环语句会消费它。

#### 声明：
##### 声明的语法
- function
- function *
- async function
- async function *
- var
- class 在声明前使用报错
- const 在声明前使用报错
- let 在声明前使用报错

##### 预处理机制
function的声明会最早处理，即使是放在代码末尾

var声明的变量会提升到function/script/module范围内

const、let、class则是预处理到最近的花括号范围内，如果声明前使用会报错：let/class会抛出可以try-catch捕获的ReferenceError，而const会抛出SyntaxError

### 结构化：

#### 宏任务与微任务：
宏任务是js交给引擎的任务，微任务是引擎内部的任务，微任务由Promise产生。在宏任务中，异步任务会分出来一个新的微任务(Job)。

#### 函数调用：

代码/函数运行的时候，会存在一个栈空间保存当前所有信息，这个栈空间称为**执行上下文（Execution Context）**。

##### 执行上下文（Execution Context）存了什么？

- code evaluation state：用于async和generator函数，表示代码运行到的位置
- Function：function初始化独有的
- Script or Module：表示代码位置是处于script还是module
- Generator：generator函数独有的
- Realm：保存内置对象的区域
- LexicalEnvironment：旧标准下只存变量，ES2018后有this,new.target,super,变量
- VariableEnvironment：用于var声明的变量环境

运行函数会创建新的栈在最上层，形成从左到右的栈结构，保存这些多个Execution Context的空间称呼为**执行上下文栈（Execution Context Stack）**

##### Environment Record

- Declarartive Environment Record
  - Function Environment Record
  - module Environment Record

- Global Environment Record

- Object Environment Record

##### 闭包
函数声明时，除了自身代码，还会保存当时的Environment Record到函数身上，所以执行之后能够访问函数所在上下文的变量。

Environment Record会形成链式的结构（scope chain），链接到上一级的Environment Record

##### Realm