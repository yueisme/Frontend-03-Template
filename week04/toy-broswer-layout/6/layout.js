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
  //添加默认值
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

  let isAutoMainSize = false;//元素声明主轴方向尺寸？
  if (!style[mainSize]) { //没有就是auto根据子元素决定
    elementStyle[mainSize] = 0;
    for (let i = 0; i < childItems.length; i++) {
      let item      = childItems[i];
      let itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[crossSize] !== (void 0)) {
        //单纯的叠加
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
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }
  flexLine.mainSpace = mainSpace;

  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    //css样式优先，其次是auto的高度
    flexLine.crossSpace = (style[crossSize] !== void 0) ? style[crossSize] : crossSpace;
  }
  else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    //单行
    let scale       = style[mainSize] / (style[mainSize] - mainSpace); //TODO 还没有理解
    let currentMain = mainBase;
    for (let i = 0; i < childItems.length; i++) {
      let item      = childItems[i];
      let itemStyle = getStyle(item);
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }
      itemStyle[mainSize]  = itemStyle[mainSize] * scale;
      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd]   = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain          = itemStyle[mainEnd];
    }
  }
  else {
    flexLines.forEach(function (items) {
      let mainSpace = items.mainSpace;
      let flexTotal = 0; //统计当前行的flex元素数量
      for (let i = 0; i < items.length; i++) {
        let item      = items[i];
        let itemStyle = getStyle(item);
        if ((itemStyle.flex !== null) && (itemStyle.flex !== void 0)) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        let currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          let item      = items[i];
          let itemStyle = getStyle(item);
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd]   = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain          = itemStyle[mainEnd];
        }
      }
      else {
        if (style.justifyContent === 'flex-start') {
          var currentMain = mainBase;
          var step        = 0;
        }
        else if (style.justifyContent === 'flex-end') {
          var currentMain = mainSpace * mainSign + mainBase;
          var step        = 0;
        }
        else if (style.justifyContent === 'center') {
          var currentMain = mainSpace / 2 * mainSign + mainBase;
          var step        = 0;
        }
        else if (style.justifyContent === 'space-between') {
          var currentMain = mainBase;
          var step        = mainSpace / (items.length - 1) * mainSign;
        }
        else if (style.justifyContent === 'space-around') {
          var step        = mainSpace / (items.length) * mainSign;
          var currentMain = step / 2 + mainBase;
        }

        for (let i = 0; i < items.length; i++) {
          let item             = items[i];
          let itemStyle        = getStyle(item);
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd]   = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain          = itemStyle[mainEnd] + step;
        }
      }
    });
  }

  //交叉轴的处理
  crossSpace = 0;
  if (!style[crossSize]) {//元素声明交叉轴方向尺寸？
    crossSpace              = 0;
    elementStyle[crossSize] = 0;
    //auto模式，每个行的交叉轴尺寸相加得出
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSize;
    }
  }
  else {
    crossSpace = style[crossSize];
    //已经声明交叉轴尺寸，减去每个行占用得出剩余尺寸
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSize;
    }
  }

  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize] || 0;
  }
  else {
    crossBase = 0;
  }
  let lineSize = style[crossSize] / flexLines.length;

  let step;//每个元素的间隔距离
  if (style.alignContent === 'flex-start') {
    crossBase += 0;
    step = 0;
  }
  else if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  else if (style.alignContent === 'center') {
    crossBase += crossSign * crossSpace / 2;
    step = 0;
  }
  else if (style.alignContent === 'space-between') {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  else if (style.alignContent === 'space-around') {
    step = crossSpace / (flexLines.length);
    crossBase += crossSign * step / 2;
  }
  else if (style.alignContent === 'stretch') {
    crossBase += 0;
    step = 0;
  }

  flexLines.forEach(items => {
    let lineCrossSize = style.alignContent === 'stretch' ?
      items.crossSpace + crossSpace / flexLines.length :
      items.crossSpace;
    for (let i = 0; i < items.length; i++) {
      let item      = items[i];
      let itemStyle = getStyle(item);
      let align     = itemStyle.alignSelf || style.alignItems;
      if (itemStyle[crossSize] === null) {
        itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0;
      }
      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd]   = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      else if (align === 'flex-end') {
        itemStyle[crossEnd]   = crossBase + crossSign * lineCrossSize;
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }
      else if (align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
        itemStyle[crossEnd]   = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      else if (align === 'stretch') {
        void 0;
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd]   = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : items.crossSpace);
        itemStyle[crossSize]  = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });

  console.log(childItems);

}

module.exports = layout;