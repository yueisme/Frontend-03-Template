学习笔记

### 四则运算

四则运算允许使用的字符：

- 数字 `0-9`
- 小数点 `.`
- 运算符 `+ - * /`
- 空白字符 `<SP>`
- 换行字符 `<CR>` `<LF>`

语法和产生式：

```text
<Expression> ::=
  <AdditiveExpression><EOF>

<AdditiveExpression> ::=
  <MultiplicativeExpression>
| <AdditiveExpression><+><MultiplicativeExpression>
| <AdditiveExpression><-><MultiplicativeExpression>

<MultiplicativeExpression> ::=
  <Number>
| <MultiplicativeExpression><*><Number>
| <MultiplicativeExpression></><Number>
```

我们在语法分析阶段时候需要做表达式的展开，用AdditiveExpression举例：
```text
<AdditiveExpression> ::=
  <Number>
| <MultiplicativeExpression> * <Number>
| <MultiplicativeExpression> / <Number>
| <AdditiveExpression> + <MultiplicativeExpression>
| <AdditiveExpression> - <MultiplicativeExpression>
```

### LL算法构建AST


> AST：抽象语法树（Abstract Syntax Tree）
> 
> 构建语法树（语法分析）的算法：LL算法（从左到右扫描和规约），LR算法

#### 词法分析

编写正则表达式，提取出四则运算的字符：

```regexp
/(\-?\d+\.?\d*)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g
```

#### 解析出语法树：

- 按照四则运算规则的优先级产生非终结符：
  1. MultiplicativeExpression
  1. AdditiveExpression
  1. Expression
- 递归调用自身解析表达式后续部分