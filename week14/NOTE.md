学习笔记

### 初步建立动画和时间线

使用Javascript实现的动画
上周的动画依靠CSS实现，这周课老师讲了JS实现动画的几种方式：
- 定时器
  - `setInterval()`
  - `setTimeout()`
- `window.requestAnimationFrame()` 

定时器法：按60帧标准制作，16ms（约等于1000/60），`setInterval()`可能会有积压的隐患，`setTimeout()`的精度也不佳。

现代浏览器更适合`window.requestAnimationFrame()` ，会跟随浏览器帧率执行。

> https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame
>
> https://harttle.land/2017/08/15/browser-render-frame.html
>
> https://kaola-fed.github.io/2016/06/17/JS%E4%B8%AD%E7%9A%84%E4%BA%8B%E4%BB%B6%E5%BE%AA%E7%8E%AF%E4%B8%8E%E5%AE%9A%E6%97%B6%E5%99%A8/

#### 实现TimeLine
把执行帧操作的函数称为 tick 函数，尝试包装成`TimeLine`类，考虑需要：
- 内部管理 tick 的能力
- 支持托管动画，利用`Set`保存各个动画的队列
- 使用`window.requestAnimationFrame()`来实现每个tick的触发

设计接口：
- start()
- pause()
- resume()
- reset()
- add()

使用`Symbol`的唯一特性，为object key实现私有成员的技巧。

#### Animation类

属性动画的接口设计：

`constructor()`：需要接受对象和属性，起始值，结束值，动画时间，插值函数

`recive()`：接收TimeLine提供的时间，结合插值函数，实现帧内属性的变化。

### 设计时间线的更新

完善时间功能，支持`start()`后的动画运行：

`TimeLine.add()`：增加一个时间参数，默认是当前时间戳，并使用一个Map保存动画的开始时间。

`TimeLine.start()`：修改tick函数，判断当前时间是否在动画启动时间之前，使`TimeLine`能够可以在`start()`之后`add()`的动画正常运行。

重点就是记录动画的起始时间戳，通过辨识时间戳是否到达运行时间点而运行动画。


### 给动画添加暂停和重启功能


`pause()`：使用`cancelAnimationFrame()`停止tick运行，记录暂停的开始时间`PAUSE_START`

`resume()`：使用当前时间减去`PAUSE_START`时间，结果就是暂停的时间长度`PAUSE_TIME`。

`tick`函数：tick计算时间时减去暂停的时间`PAUSE_TIME`。

> CSS动画的暂停：https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-play-state

### 完善动画的其他功能

动画的`delay`：tick计算时间时减去`Animation`的`delay`值。

添加贝塞尔曲线函数库增加缓动功能：https://github.com/gre/bezier-easing

`resume()`：重置`TimeLine`的内部存储。

添加类内部状态。