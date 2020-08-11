const EOF = Symbol('EOF');

let words = /^[a-zA-Z]$/;
let spaceCharReg = /^[ \t\n\f]$/;

function data(c) {
  if (c === '<') { //是不是标签
    return tagOpen;
  }
  else if (c === EOF) {
    return;
  }
  else {
    return data;
  }
}

function tagOpen(c) {
  if (c === '/') { //结束标签
    return endTagOpen;
  }
  else if (c.match(words)) { //起始标签的名称
    return tagName;
  }
  else { }
}

function endTagOpen(c){
  if(c.match(words)){ //结束标签的名称
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
  else if(c.match(words)){ return tagName; }
  else if(c==='>'){ return data; }
  else { return tagName; }
}

function beforeAttributeName(c){
  if(c.match(spaceCharReg)){
    return beforeAttributeName; //略过
  }
  else if(c==='>'){ return data; }
  else if(c==='='){ return beforeAttributeName; }
  else { return beforeAttributeName; }
}

function selfClosingStartTag(c){
  if(c==='>'){ //自封闭标签结束
    //currentToken.isSelfClosing = true;
    return data;
  }
  else if(c===EOF){}
  else {}
}

module.exports.parseHTML = function parseHTML(htmlText) {
  let state = data;
  console.debug(`state: ${state.name}`);
  for (let c of htmlText) {
    let prevstate = state.name;
    state         = state(c);
    console.debug(`${JSON.stringify(c)} state: ${prevstate}->${state.name}`);
  }
  state = state(EOF);
};
