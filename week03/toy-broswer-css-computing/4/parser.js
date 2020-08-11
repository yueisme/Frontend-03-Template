const EOF = Symbol('EOF');
const CSS = require('css');

let words            = /^[a-zA-Z]$/;
let spaceCharReg     = /^[ \t\n\f]$/;
let currentToken     = null;
let currentAttribute = null;
let currentTextNode  = null;

let stack = [{type: 'document', children: []}];

let cssRules = [];

function addCssRules(text) {
  let ast = CSS.parse(text);
  console.log(JSON.stringify(ast, null, "    "));
  cssRules.push(...ast.stylesheet.rules);
}

function cssMatch(element, selector) {

}

function computeCss(element) {
  //栈做一次快照，由内往外排列
  let elements = stack.concat().reverse();
  if (!element.computedStyle) {
    element.computedStyle = {};
  }
  //TODO 实现复合选择器
  for (let rule of cssRules) {
    if (rule.type !== 'rule') {
      //略过注释，只处理样式的内容
      continue;
    }
    //只取第一个selector
    let selectorParts = rule.selectors[0].split(' ').filter(s => s !== '').reverse();
    //split拆分复杂选择器，通过循环由内往外排列
    if (!cssMatch(element, selectorParts[0])) {
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
      console.log('Element', element, 'matched rule', rule);
      //todo
    }
  }
}

function emit(token) {
  console.log('emit:', JSON.stringify(token));
  let top = stack[stack.length - 1];
  if (token.type === 'startTag') {
    let element = {type: 'element', tagName: token.tagName, children: [], attributes: []};
    for (let p in token) {
      if (p !== 'type' && p !== 'tagName') {
        element.attributes.push({name: p, value: token[p]});
      }
    }

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
