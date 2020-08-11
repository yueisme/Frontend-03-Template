const EOF = Symbol('EOF');
const CSS = require('css');

let words            = /^[a-zA-Z]$/;
let spaceCharReg     = /^[ \t\n\f]$/;
let bothStyleReg     = /[a-zA-Z]{1}[a-zA-Z0-9]*|\.[a-zA-Z]{1}[a-zA-Z0-9]*|#[a-zA-Z0-9]+/g;
let currentToken     = null;
let currentAttribute = null;
let currentTextNode  = null;

let stack = [{type: 'document', children: []}];

let cssRules = [];

function addCssRules(text) {
  let ast = CSS.parse(text);
  //console.log(JSON.stringify(ast, null, "    "));
  cssRules.push(...ast.stylesheet.rules);
}

function specificity(selector) {
  let p             = [0, 0, 0, 0];
  let selectorParts = selector.split(' ');
  for (let part of selectorParts) {
    //✅复合选择器 div.text#id1
    let d = part.match(bothStyleReg);
    //如果是复合选择器则拆分判断，简单选择器和复杂选择器会被拆分到下面的else部分
    if (d && d.length > 1) {
      Array.from(d).forEach(singleSelector => {
        let firstChar = singleSelector.charAt(0);
        if (firstChar === '#') {
          p[1] += 1;
        }
        else if (firstChar === '.') {
          p[2] += 1;
        }
        else {
          p[3] += 1;
        }
      });
    }
    else {
      let firstChar = part.charAt(0);
      if (firstChar === '#') {
        p[1] += 1;
      }
      else if (firstChar === '.') {
        p[2] += 1;
      }
      else {
        p[3] += 1;
      }
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2];
  }
  return sp1[3] - sp2[3];
}

function cssMatch(element, selector) {
  if (!selector || !element.attributes) {
    return false;
  }

  //✅通用选择器
  if (selector === '*') {
    return true;
  }

  let s = selector.charAt(0);
  if (s === '#') {
    //id选择器
    let attr = element.attributes.filter(attr => attr.name === 'id')[0];
    if (attr && attr.value === selector.replace('#', '')) {
      return true;
    }
  }
  else if (s === '.') {
    //class选择器
    let attr = element.attributes.filter(attr => attr.name === 'class')[0];
    //✅支持空格的多个class选择器 <div id="id1" class="text class2">
    if (attr && attr.value.split(' ').indexOf(selector.replace('.', '')) >= 0) {
      return true;
    }
  }
  else {
    //标签选择器
    if (element.tagName === selector) {
      return true;
    }
  }
  return false;
}

function computeCss(element) {
  //栈做一次快照，由内往外排列
  let elements = stack.concat().reverse();
  if (!element.computedStyle) {
    element.computedStyle = {};
  }

  for (let rule of cssRules) {
    if (rule.type !== 'rule') {
      //✅略过注释，只处理样式的内容
      continue;
    }
    //只取第一个selector
    let selectorParts = rule.selectors[0].split(' ').filter(s => s !== '').reverse();
    //split拆分复杂选择器，通过循环由内往外排列

    //✅复合选择器 div.text#id1
    //支持tagname.class#id的组合
    let d = rule.selectors[0].match(bothStyleReg);
    //带空格的复杂选择器不在这里处理
    if (rule.selectors[0].indexOf(' ') < 0 && d && d.length > 1) {
      //遍历每个规则确保全部符合
      if (Array.from(d).every(singleSelector => cssMatch(element, singleSelector)) === false) {
        continue;
      }
      void 0;
    }
    else if (!cssMatch(element, selectorParts[0])) {
      continue; //规则完全不匹配，跳过
    }

    let matched = false;
    let j       = 1;
    //继续检查父元素的匹配情况，所以从selectorParts[1]开始
    //element此时尚未入栈，所以栈里的都是它父元素
    for (let i = 0; i < elements.length; i++) {
      if (cssMatch(elements[i], selectorParts[j])) {
        j++;
      }
    }
    if (j >= selectorParts.length) {
      matched = true;
    }
    if (matched) {
      let sp            = specificity(rule.selectors[0]);
      let computedStyle = element.computedStyle;
      for (let declaration of rule.declarations) {
        if (declaration.type !== 'declaration') {
          continue; //✅注释之类的跳过
        }
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};
        }
        if (declaration.property === 'font-size') {
          void 0;
        }
        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value       = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
        else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          //重复的css需要compare比较优先级
          computedStyle[declaration.property].value       = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
      console.log('element computed:', JSON.stringify(element.computedStyle));
    }
  }
}

function emit(token) {
  token.type !== 'text' && console.log('emit:', JSON.stringify(token));
  let top = stack[stack.length - 1];
  if (token.type === 'startTag') {
    let element = {type: 'element', tagName: token.tagName, children: [], attributes: []};
    for (let p in token) {
      if (p !== 'type' && p !== 'tagName') {
        element.attributes.push({name: p, value: token[p]});
      }
    }

    // 因为html和head整个部分都在parse css之前完成所以规则无法应用到这部分
    computeCss(element);

    top.children.push(element);
    element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }
    currentTextNode = null;
  }
  else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error('Tag start end doesn\'t match!');
    }
    else {
      // 遇到style标签添加css规则
      if (top.tagName === 'style') {
        addCssRules(top.children[0].content);
      }
      stack.pop();
    }
    currentTextNode = null;
  }
  else if (token.type === 'text') {
    if (currentTextNode == null) {
      currentTextNode = {type: 'text', content: ''};
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

function data(c) {
  if (c === '<') { //是不是标签
    return tagOpen;
  }
  else if (c === EOF) {
    emit({type: 'EOF'})
    return;
  }
  else {
    emit({type: 'text', content: c});
    return data;
  }
}

function tagOpen(c) {
  if (c === '/') { //结束标签
    return endTagOpen;
  }
  else if (c.match(words)) { //标签开始
    currentToken = {type: 'startTag', tagName: ''};
    return tagName(c);
  }
  else {
  }
}

function endTagOpen(c) {
  if (c.match(words)) { //结束标签的名称
    currentToken = {type: 'endTag', tagName: ''};
    return tagName(c);
  }
  else if (c === '>') {
  }
  else if (c === EOF) {
  }
  else {
  }
}

function tagName(c) {
  if (c.match(spaceCharReg)) { //遇到空格符，表示后面是属性
    return beforeAttributeName;
  }
  else if (c === '/') { //自封闭标签的结尾
    return selfClosingStartTag;
  }
  else if (c.match(words)) {
    currentToken.tagName += c;
    return tagName;
  }
  else if (c === '>') {
    emit(currentToken);
    return data;
  }
  else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(spaceCharReg)) {
    return beforeAttributeName; //略过
  }
  else if (c === '>' || c === '/' || c === EOF) {
    return afterAttributeName(c);
  }
  else if (c === '=') {
  }
  else {
    currentAttribute = {name: '', value: ''};
    return attributeName(c);
  }
}

function attributeName(c) {
  if (c.match(spaceCharReg) || c === '>' || c === '/' || c === EOF) {
    return afterAttributeName(c);
  }
  else if (c === '=') {
    return beforeAttributeValue;
  }
  else if (c === '\u0000') {
  }
  else if (c === `"` || c === `'` || c === `<`) {

  }
  else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c) {
  if (c.match(spaceCharReg) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue;
  }
  else if (c === `"`) {
    return doubleQuotedAttributeValue;
  }
  else if (c === `'`) {
    return singleQuotedAttributeValue;
  }
  else if (c === `>`) {

  }
  else {
    return UnquotedAttributeValue(c);
  }
}

function doubleQuotedAttributeValue(c) {
  if (c === `"`) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  }
  else if (c === `\u0000`) {
  }
  else if (c === EOF) {

  }
  else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c === `'`) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  }
  else if (c === `\u0000`) {
  }
  else if (c === EOF) {

  }
  else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

function UnquotedAttributeValue(c) {
  if (c.match(spaceCharReg)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  }
  else if (c === `/`) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  }
  else if (c === `>`) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  }
  else if (c === `\u0000`) {

  }
  else if (c === `"` || c === `'` || c === `<` || c === `=` || c === '`') {

  }
  else if (c === EOF) {

  }
  else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

function afterAttributeName(c) {
  if (c.match(spaceCharReg)) {
    return afterAttributeName;
  }
  else if (c === `/`) {
    return selfClosingStartTag;
  }
  else if (c === `=`) {
    return beforeAttributeValue;
  }
  else if (c === `>`) {
    emit(currentToken);
    return data;
  }
  else if (c === EOF) {

  }
  else {
    currentAttribute = {name: '', value: ''};
    return attributeName(c);
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(spaceCharReg)) {
    return beforeAttributeName;
  }
  else if (c === `/`) {
    return selfClosingStartTag;
  }
  else if (c === `>`) {
    emit(currentToken);
    return data;
  }
  else if (c === EOF) {

  }
  else {
    return beforeAttributeName(c);
  }
}

function selfClosingStartTag(c) {
  if (c === '>') { //自封闭标签结束
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  }
  else if (c === EOF) {
  }
  else {
    return beforeAttributeName(c);
  }
}

module.exports.parseHTML = function parseHTML(htmlText) {
  let state = data;
  console.debug(`state: ${state.name}`);
  for (let c of htmlText) {
    let prevstate = state.name;
    state         = state(c);
    //console.debug(`${JSON.stringify(c)} state: ${prevstate}->${state.name}`);
  }
  state = state(EOF);
  console.log(stack);
};
