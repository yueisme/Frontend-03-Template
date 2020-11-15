学习笔记


### 手势的基本知识

区分点击，拖拽，移动

抽象手势事件模型，通过托管鼠标事件和触摸事件完成：

- `start` 起始事件
- `cancel` 手势取消
- `tap` 点击
- `press-start` 长按屏幕（tap 0.5s后）
- `press-end` 长按结束
- `pan-start` pan起始事件（tap或press发生后移动了若干距离，常用`window.devicePixelRatio * 5px`）
- `pan-move` 屏幕滑动
- `flick` (swipe) 较快速度的滑动（pan发生后）
- `pan-end` pan结束

> https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent
>
> https://developer.mozilla.org/zh-CN/docs/Web/API/Touch
>
> https://developer.mozilla.org/zh-CN/docs/Web/API/Pointer_events


### 实现鼠标操作
对`document.documentElement`添加事件监听：

- `mousedown`，`touchstart`合并成**start**事件
- `mousemove`，`touchmove`合并成**move**事件
- `mouseup`，`touchend`合并成**end**事件


### 实现手势的逻辑

使用变量存储当前事件类型：isTap=true，isPress=false，isPan=false，

在`start`事件中：
- 使用`setTimeout()`设置0.5s的定时器触发**press-start**，定时器会设置isPress=true
- 记录事件的起始坐标
- 设置isTap设为true

在`move`事件中：
- 判断移动距离：
```
const trigger_distance = Math.pow(window.devicePixelRatio * 5, 2);
if (!isPan && dx ** 2 + dy ** 2 > trigger_distance) {
  // ...
}
```
- 如果移动距离达到触发值并且不是pan事件类型，触发**pan-start**事件，并关闭press定时器，设置事件类型为pan（isPan=true）
- 如果已经是pan事件类型，触发**pan-move**事件

在`end`事件中：
- 如果是isTap，触发**tap**事件，并关闭press定时器
- 如果是isPress，触发**press-end**事件
- 如果是isPan，触发**pan-end**事件

### 处理鼠标事件

从触屏角度考虑，会有多个触摸点的情况，从鼠标角度考虑，会有多个鼠标按键的情况。使用唯一的bool型变量无法容纳足够信息判断事件。

建立全局变量contexts，在`mousedown`和`touchstart`时为每个触摸点/鼠标按键建立不同的context，在end和cancel时清除context。

修改触摸屏事件：以`Touch.identifier`为key保存context

修改鼠标事件：以二进制掩码的方式理解`MouseEvent.buttons`的设计，通过二进制移位获得按下的键，分别为按下的键保存context

> https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/buttons
>
> https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators

**按键对应**

按键 | MouseEvent.button | MouseEvent.buttons
---|---|---
主按键（右手鼠标的左键） | 0 | 1
辅助按键（中键）  | 1 | 4
次按键（右手鼠标的右键）  | 2 | 2
第四个按钮（后退键） | 3 | 8
第五个按钮（前进键） | 4 | 16

可以看出，在按下一个按键时，可以用`1 << MouseEvent.button`操作对应得出`MouseEvent.buttons`。利用这个对应关系，在mousemove中，使用`MouseEvent.buttons`区分


```javascript
let button = 1;
while (button <= moveEvent.buttons) {
  //通过与运算判断某一位按键是否按下，如果按下则运算结果大于0使得if条件成立
  if (button & moveEvent.buttons) {
    //MouseEvent.buttons的顺序和MouseEvent.button不一致
    let key = button;
    if (button === 2) {
      key = 4;
    } else if (button === 4) {
      key = 2;
    }
    let context = contexts.get("mouse" + key);
    move(moveEvent, context);
  }
  button = button << 1; //向左移动1位，用于下一位判断，对应顺序是从低到高
}
/*
button移位操作的变化
0b00001
0b00010
0b00100
0b01000
0b10000
*/
```

使用全局变量`isListeningMouse`做一个锁，防止多个鼠标按键按下后重复监听事件，确保mousedown之后只监听一次mouseup和mousemove，在最后一次mouseup中通过`buttons===0`判断是否结束全部的操作。

### 派发事件

在手势完成的代码中，使用`Element.dispatchEvent()`派发手势事件。

> https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/dispatchEvent

### 实现一个flick事件

对滑动速度判断：存储一段时间内的点算出速度，数组中保存`clientX`，`clientY`，时间戳三项。

在`start`的时机，在context中初始化数组，加入起始点位的信息。

在`move`的时机，加入最新的点位，并把0.5s前的数据视为过时筛去。

在`end`的时机，把0.5s前的数据视为过时筛去，求出数组最早的位置和end时的位置的距离和时间差，用速度公式`v = d / t`得出速度`v`，如果速度`v`大于`1.5`则视为满足触发`flick`事件的条件。

### 封装代码

对代码功能解耦，分成监听，识别，派发3个部分。

把代码按功能移到类中，按模块的方式提供使用：
```
// gesture.js
export class Listener {};
export class Recognizer {};
export class Dispatcher {};

export function enableGesture(element) {
  return new Listener(element, new Recognizer(new Dispatcher(element)));
};

// use
import {enableGesture} from './gesture.js';
enableGesture(document.documentElement);

document.documentElement.addEventListener("tap", function (event) {
  console.log(`${event.type}`);
});
```
