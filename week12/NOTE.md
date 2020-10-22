学习笔记

## Proxy与双向绑定

Proxy是强大且具有危险性的特性，可以使用Proxy实现对object的观察模式，对object的行为做出影响（导致行为不可预期）。

> https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy

### 模仿reactive实现原理

使用Proxy实现hook效果：

```javascript
let object = { a: 1 };

let px = new Proxy(object, {
  set(obj, prop, val) {
    console.log(...arguments);
    obj[prop]=val;
  },
  get(obj, prop) {
    console.log(...arguments);
    return obj[prop];
  },
});

object.a; // 没有console
px.a; // will console
```

实现一个effect函数，能够在object被修改时运行callback通知。

```javascript
let reactivties = new Map(); //保存proxy后的对象，全局存储
let callbacks = new Map(); //保存callback
let usedReactivties = [];

function reactive(object) {
  if (reactivties.has(object)) {
    return reactivties.get(object);
  }
  let px = new Proxy(object, {
    set(obj, prop, val) {
      // console.log(...arguments);
      obj[prop] = val;
      if (callbacks.get(obj)) {
        if (callbacks.get(obj).get(prop)) {
          for (let callback of callbacks.get(obj).get(prop)) {
            callback();
          }
        }
        return;
      }
    },
    get(obj, prop) {
      // console.log(...arguments);
      let reactivity = [obj, prop];
      usedReactivties.push(reactivity);
      if (typeof obj[prop] === "object") {
        return reactive(obj[prop]);
      }
      return obj[prop];
    },
  });
  reactivties.set(object, px);
  return px;
}

function effect(callback) {
  usedReactivties = [];
  callback(); //利用callback里面的`console.log(p.a)`会访问get hook的特性，收集回调
  // console.log(usedReactivties);

  //创建了map做索引
  for (let reactivity of usedReactivties) {
    // reactivity[0]为被proxy的原object
    // reactivity[1]被访问的object prop
    if (!callbacks.has(reactivity[0])) {
      callbacks.set(reactivity[0], new Map());
    }
    if (!callbacks.get(reactivity[0]).has(reactivity[1])) {
      callbacks.get(reactivity[0]).set(reactivity[1], []);
    }
    callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
  }
}
```

验证效果：
```javascript
let object = {
  a: {
    b: 3,
  },
  b: 2,
};

let p = reactive(object);

effect(() => {
  // will run when p.a.b change
  console.log(p.a.b);
});

p.a.b = 9;
console.log(p.a); // proxy实例
```

## 使用Range实现DOM精确操作

### 普通拖拽的实现

对需要拖拽的元素添加鼠标事件：
- mousedown：开始监听 mousemove, mouseup 事件，记录鼠标起始位置。
- mousemove：移动元素位置。
- mouseup： 移除 mousemove 和 mouseup 监听的事件。


#### 注意的细节：

- `mousemove` 和 `mouseup` 事件需要在document对象上监听，否则容易出现事件中断的现象。

- 移动元素位置的方案有如下几种，使用第一种实现：
  1. 利用CSS `transform` 属性的 `translate()` 函数调整元素渲染的实际位置。
  2. 对 `position: absolute / relative / fixed` 的元素直接调整 `left` `top` 的值。

- 移动中的鼠标位置需要减去鼠标起始位置并加上鼠标起始位置的`translate()`参数，才得出 `translate()` 的实际位置。

- `mouseup` 事件之后保存最新的`translate()` 的参数。

课程上的 `baseX` 和 `baseY` 初始值为0，其实不太科学，这里没有考虑到元素可能自身原始的位置已经不是0了。所以更科学的方式应该是用 `getComputedStyle(element).transform` 取出初始值。

> https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/translate

### 正常流里的拖拽

实现的步骤：

- 鼠标事件的监听：和普通拖拽一样。
- 创建Range，对容器里面文字**逐字创建range对象**（浏览器会合并连续的文字到一个textNode中，用 `container.childNodes[0].textContent` 处理）
- mousemove：
  1. 遍历所有 `range`，找出距离最小的
  2. 利用 `range.getBoundingClientRect()` 取得坐标位置，和鼠标mousedown的位置比较得出距离最近的 `range`。 
  1. 使用 `range.insertNode(element)` 实现元素移动。

