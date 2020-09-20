学习笔记

## TicTacToe

#### 绘制棋盘
使用二维数组表示3x3的棋盘，使用双重循环遍历数组生成DOM。

#### 下棋动作函数
使用一个变量指定玩家，通过点击棋盘的事件改变数组内容并且重新绘制。点击之后变量指向另一位玩家，并且检查玩家是否获胜。

#### 获胜判定
从横向，纵向，左上角到右下，右上到左下四个方向判断。连续三个为同一玩家棋子则获胜。

#### will win
玩家下棋之后，检查棋盘没有棋子的位置，模拟对手下了某一个点后是否马上获胜（使用check和clone）。

#### AI策略
1. 寻找某个能获胜的点位。
2. 如果1没有，寻找一个不会输的位置。
3. 如果2没有，寻找一个能和棋的位置。

通过递归方式，暴力模拟后续的下棋后果，寻找最好的选择。

## 异步

callback函数：最基础的的使用方式，利用函数可以作为参数的规则处理异步api。

Promise：来自Promise/A+规范，是一种设计模式。

async/await：Promise的语法糖，错误可以被try-catch语句捕获。

Generator

Async Generator

> https://promisesaplus.com/
>
>https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
