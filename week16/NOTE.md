学习笔记

### 手势动画应用

- 引入上周完成的手势库和动画库。
- 使用手势事件替代轮播组件的鼠标事件代码。

**取余运算的调整**：
```
for (let offset of [-1, 0, 1]) {
  //求出dom的index位置
  let pos = current + offset;
  pos = (pos % children.length + children.length) % children.length;
}
```

**计算动画挪动的距离**：

记录参数`t`作为动画起始时间，默认值为0，在`end`事件和计时器中更新为当前时间。

记录参数`ax`为进度，默认值为0，在`start`事件中计算进度：`let progress = (Date.now() - t) / 500;`。

把进度代入缓动函数中得出移动的数值：`ax = ease(progress) * 500 - 500;`

**timeline和animation**：

- 在`start`事件中暂停timeline停止动画执行；在`end`事件中reset清除未完成的动画，重新开始timeline。
- 去掉CSS的动画，改用`Animation`类处理。

**定时任务管理**：
- 在`start`清除定时任务；在`end`事件充新运行定时任务。

### 为组件添加更多属性（一）

**代码结构优化**：
- `Carousel`组件的`setAttribute()`是可以组件共用的，移动到`Component`类中。
- `Carousel`组件的`mountTo()`移动到`Component`类中。

`Carousel`组件的状态和属性都是在`render()`函数范围内，把它提升到组件的级别使得可以外部访问。使用Symbol实现私有访问的技巧，并且提供Symbol给使用者访问state。

```javascript
export const STATE = Symbol("STATE");
export const ATTRIBUTES = Symbol("ATTRIBUTES");
```

**组件的状态和属性**：
- 修改`Component`类，并且暴露STATE和ATTRIBUTES的Symbol用于访问。
- 修改`Carousel`组件，把STATE和ATTRIBUTES存到组件中。

**使用事件获得组件的状态**：

- 设计组件的事件：给`Component`类加上`triggerEvent()`方法，发送一个`CustomEvent`
```javascript
triggerEvent(type, args) {
  let e = this[ATTRIBUTES]["on".concat(type.replace(/^[\s\S]/, (c) => c.toUpperCase()))];
  e && e(new CustomEvent(type, { detail: args }));
}
```

- 修改`Carousel`组件，在适当的时机使用`this.triggerEvent("event-name", {})`发射事件传递组件的状态state给组件使用者。


### 为组件添加更多属性（二）

内容型children，children是根据代码可见数量的；模板型children，从模板产生children的形式，数量不固定。

通过重载`Component`类的方法，实现自定义组件和html原生组件部分一致的API：`setAttribute()`，`append()`。

**内容型children的组件Button**：

`append()`方法不会把children放入this.root，而是放入到内部的`<button/>`中：

```jsx
class Button extends Component {
  constructor() {
    super();
  }

  render() {
    this.child = <button></button>;
    this.root = (<div>{this.child}</div>).render();
    return this.root;
  }

  append(c) {
    if(!this.child){
      this.render();
    }
    this.child.append(c);
  }
}
```

**template型的组件List**：

重载`append()`方法，接收模板函数并通过模板转换为组件的形式，并且修改代码支持children数组

```jsx
class List extends Component {
  constructor() {
    super();
  }

  render() {
    this.child = this[ATTRIBUTES].data.map(this.template);
    this.root = (<ul>{this.child}</ul>).render();

    return this.root;
  }

  append(c) {
    this.template = c;
    this.render();
  }
}
```
