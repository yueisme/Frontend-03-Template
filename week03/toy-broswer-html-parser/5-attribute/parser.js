const EOF = Symbol('EOF');

let words = /^[a-zA-Z]$/;
let spaceCharReg = /^[ \t\n\f]$/;
let currentToken = null;
let currentAttribute = null;

function emit(token) {
  console.log('emit:',JSON.stringify(token));
}

function data(c) {
  if (c === '<') { //是不是标签
    return tagOpen;
  }
  else if (c === EOF) {
    emit({type :'EOF'})
    return;
  }
  else {
    emit({type :'text', content: c});
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
  else { }
}

function endTagOpen(c){
  if(c.match(words)){ //结束标签的名称
    currentToken = {type: 'endTag', tagName: ''};
    return tagName(c);
  }
  else if(c==='>'){ }
  else if(c===EOF){ }
  else {}
}

function tagName(c){
  if(c.match(spaceCharReg)){ //遇到空格符，表示后面是属性
    return beforeAttributeName;
  }
  else if(c==='/'){ //自封闭标签的结尾
    return selfClosingStartTag;
  }
  else if(c.match(words)){
    currentToken.tagName += c;
    return tagName;
  }
  else if(c==='>'){
    emit(currentToken);
    return data;
  }
  else { return tagName; }
}

function beforeAttributeName(c) {
  if(c.match(spaceCharReg)){
    return beforeAttributeName; //略过
  }
  else if (c === '>' || c === '/' || c === EOF) {
    return afterAttributeName(c);
  }
  else if(c==='=') { }
  else {
    currentAttribute = {name: '', value: ''};
    return attributeName(c);
  }
}

function attributeName(c) {
  if(c.match(spaceCharReg) || c === '>' || c === '/' || c === EOF){
    return afterAttributeName(c);
  }
  else if (c === '=') {
    return beforeAttributeValue;
  }
  else if (c === '\u0000') {
  }
  else if (c === `"` || c===`'` || c===`<`) {

  }
  else {
    currentAttribute.name += c;
    return  attributeName;
  }
}

function beforeAttributeValue(c) {
  if(c.match(spaceCharReg) || c === '/' || c === '>' || c === EOF){
    return beforeAttributeValue;
  }
  else if (c === `"`) {
    return doubleQuotedAttributeValue;
  }
  else if (c===`'` ) {
    return singleQuotedAttributeValue;
  }
  else if (c===`>`) {

  }
  else {
    return UnquotedAttributeValue(c);
  }
}

function doubleQuotedAttributeValue(c) {
 if(c===`"`){
   currentToken[currentAttribute.name] = currentAttribute.value;
   return afterQuotedAttributeValue;
 }
 else if(c===`\u0000`){
 }
 else if(c===EOF){

 }
 else {
   currentAttribute.value+=c;
   return doubleQuotedAttributeValue;
 }
}

function singleQuotedAttributeValue(c) {
  if(c===`'`){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  }
  else if(c===`\u0000`){
  }
  else if(c===EOF){

  }
  else {
    currentAttribute.value+=c;
    return singleQuotedAttributeValue;
  }
}

function UnquotedAttributeValue(c) {
  if(c.match(spaceCharReg)){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  }
  else if(c===`/`){
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  }
  else if(c===`>`){
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  }
  else if(c===`\u0000`){

  }
  else if(c===`"`||c===`'`||c===`<`||c===`=`||c==='`'){

  }
  else if(c===EOF){

  }
  else {
    currentAttribute.value+=c;
    return UnquotedAttributeValue;
  }
}

function afterAttributeName(c) {
  if(c.match(spaceCharReg)){
    return afterAttributeName;
  }
  else if(c===`/`){
    return selfClosingStartTag;
  }
  else if(c===`=`){
    return beforeAttributeValue;
  }
  else if(c===`>`){
    emit(currentToken);
    return data;
  }
  else if(c===EOF){

  }
  else {
    currentAttribute = {name: '', value: ''};
    return attributeName(c);
  }
}

function afterQuotedAttributeValue(c) {
  if(c.match(spaceCharReg)){
    return beforeAttributeName;
  }
  else if(c===`/`){
    return selfClosingStartTag;
  }
  else if(c===`>`){
    emit(currentToken);
    return data;
  }
  else if(c===EOF){

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
};
