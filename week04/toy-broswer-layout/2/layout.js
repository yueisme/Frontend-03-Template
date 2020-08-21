function getStyle(element) {
  if (!element.style) {
    element.style = {};
  }

  for (let prop in element.computedStyle) {
    let propValue       = element.computedStyle[prop].value.toString();
    element.style[prop] = propValue;

    //computedStyle的数字单位转换
    let pxreg = /(\d+)px$/;
    if (propValue.match(pxreg)) {
      element.style[prop] = parseInt(propValue.match(pxreg)[0]);
    }
    let numreg = /^\d+$|^\d+\.$|^\d+\.\d+$/;
    if (propValue.match(numreg)) {
      element.style[prop] = parseInt(propValue.match(numreg)[0]);
    }
  }
  return element.style;
}

function layout(element) {
  if (!element.computedStyle) {
    return;
  }
  let elementStyle = getStyle(element);

  if (elementStyle.display !== 'flex') {
    return;
  }
  //过滤dom stack的子节点
  let childItems = element.children
  .filter(e => e.type === 'element')
  .sort((a, b) => (a.order || 0) - (b.order || 0));

  let style = elementStyle;

  ['width', 'height'].forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    }
  });
  if (!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row';
  }
  if (!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch';
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start';
  }
  if (!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap';
  }
  if (!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch';
  }

  //设置计算排版时候用到的属性
  let mainSize, mainStart, mainEnd, mainSign, mainBase; //主轴的参数
  let crossSize, crossStart, crossEnd, crossSign, crossBase; //交叉轴的参数
  if (style.flexDirection === 'row') {
    mainSize  = 'width'; //row是横向的排版，所以用width去计算主轴的尺寸
    mainStart = 'left';
    mainEnd   = 'right';
    mainSign  = +1; //表示正方向
    mainBase  = 0;

    crossSize  = 'height';
    crossStart = 'top';
    crossEnd   = 'bottom';
  }
  else if (style.flexDirection === 'row-reverse') {
    mainSize  = 'width';
    mainStart = 'right'; //反向的排版
    mainEnd   = 'left';
    mainSign  = -1;   //表示反方向
    mainBase  = style.width;

    crossSize  = 'height';
    crossStart = 'top';
    crossEnd   = 'bottom';
  }
  else if (style.flexDirection === 'column') {
    mainSize  = 'height';
    mainStart = 'top';
    mainEnd   = 'bottom';
    mainSign  = +1;
    mainBase  = 0;

    crossSize  = 'width';
    crossStart = 'left';
    crossEnd   = 'right';
  }
  else if (style.flexDirection === 'column-reverse') {
    mainSize  = 'height';
    mainStart = 'bottom';
    mainEnd   = 'top';
    mainSign  = -1;
    mainBase  = style.height;

    crossSize  = 'width';
    crossStart = 'left';
    crossEnd   = 'right';
  }
  //反向换行
  if (style.flexWrap === 'wrap-reverse') {
    let tmp    = crossStart;
    crossStart = crossEnd;
    crossEnd   = tmp;
    crossSign  = -1;
  }
  else {
    crossBase = 0;
    crossSign = 1;
  }

  let isAutoMainSize = false;//父元素具有width吗？
  if (!style[mainSize]) { //没有就是auto根据子元素决定
    elementStyle[mainSize] = 0;
    for (let i = 0; i < childItems.length; i++) {
      let item = childItems[i];
      let itemStyle = getStyle(item);//FIXME
      if (itemStyle[mainSize] !== null || itemStyle[crossSize] !== (void 0)) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }
  //var itemStyle;

  let flexLine   = [];
  let flexLines  = [flexLine];
  let mainSpace  = elementStyle[mainSize]; //主轴的剩余空间
  let crossSpace = 0; //交叉轴的尺寸
  for (let i = 0; i < childItems.length; i++) {
    let item      = childItems[i];
    let itemStyle = getStyle(item);
    if (itemStyle[mainSize] === null) {
      itemStyle[mainSize] = 0;
    }

    if (itemStyle.flex) {
      flexLine.push(item);
    }
    else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      //更新主轴剩余尺寸
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        //行高由行内最高的一个元素决定
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
      //全部塞到一行里面
    }
    else {
      //元素尺寸大于行的情况，压缩到行的大小
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }
      //主轴的空间放不下了
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace  = mainSpace;
        flexLine.crossSpace = crossSpace;
        //创建新一行
        flexLine            = [item];
        flexLines.push(flexLine);
        //重置尺寸变量
        mainSpace  = style[mainSpace];
        crossSpace = 0;
      }
      else {
        //还能放下
        flexLine.push(item);
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }
  flexLine.mainSpace = mainSpace;
  console.log(childItems);
}

module.exports = layout;