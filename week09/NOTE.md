学习笔记

### 寻路的搜索

利用javascript的Array的特性，可以实现队列和栈：

- `.push()`: 在数组最末端插入数据
- `.pop()`: 移出数组最末端的数据
- `.unshift()`: 在数组最前端插入数据
- `.shift()`: 移出数组最前端的数据

构成队列：
- push & shift
- pop & unshift

构成栈：
- push & pop
- shift & unshift

#### 广度优先的寻路：

把起始点上下左右的点加入队列，然后对队列的点的上下左右重复逐个循环检查

```javascript
function findPath(map, start, end) {
  let queue = [start];
  function insert(x, y) {
    if (x < 0 || x >= 100 || y < 0 || y >= 100) {
      return;
    }
    let index = y * 100 + x;
    if (map[index]) {
      return;
    }
    map[index] = 2;
    queue.push([x, y]);
  }
  while (queue.length) {
    let [x, y] = queue.shift(); //先进先出，队列表现
    console.log(x, y);
    if (x === end[0] && y === end[1]) {
      return true;
    }
    insert(x - 1, y);
    insert(x + 1, y);
    insert(x, y - 1);
    insert(x, y + 1);
  }
  return false;
}
```

### 启发式搜索（A*寻路）

对比课上的代码，我们需要实现：
- f, g, h 三个值的计算，存入table
- closeSet，用来记录走过的点
- Sorted类的`take()`通过 f 值排序

g 值是上一个方块到当前方块的距离，并且和上一个方块的 g 值之和，起始点的 g 值为0。它表示了此路径移动到起始点的距离。

上一个方块到当前方块：上下左右距离为1，斜向距离为根号2（`Math.SQRT2`）。

h 值就是课上的distance函数，表示的是该点到达终点的距离，h 值有多种计算方式，我改成了曼哈顿方法，即横纵坐标距离的和。

f 值为 `g + h` 的结果。

closeSet可以使用Sorted类实现。

Sorted类的`take()`方法 f 值排序：改为读取table中对应位置的f值比较大小。

寻路过程就是寻找 f 值最小的一段路完成。

> 参考的链接：
>
> https://www.bilibili.com/video/BV1Gs411Y7ut
>
> https://www.redblobgames.com/pathfinding/a-star/introduction.html
>
> https://github.com/qiao/PathFinding.js/blob/master/src/finders/AStarFinder.js
>
> https://github.com/CodingTrain/website/blob/master/CodingChallenges/CC_051_astar/P5
