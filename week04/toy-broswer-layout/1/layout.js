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

}

module.exports = layout;