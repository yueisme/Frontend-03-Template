function createElement(type, attributes, ...children) {
  let element;
  if (typeof type === "string") {
    element = new ElementWrapeer(type);
  } else {
    element = new type();
  }
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  for (let child of children) {
    if (typeof child === "string") {
      //child = document.createTextNode(child);
      child = new TextWrapeer(child);
    }
    element.append(child);
  }

  return element;
}

class ElementWrapeer {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  append(child) {
    //this.root.append(child);
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.append(this.root);
  }
}
class TextWrapeer {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  append(child) {
    //this.root.append(child);
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.append(this.root);
  }
}
class Div {
  constructor() {
    this.root = document.createElement("div");
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  append(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.append(this.root);
  }
}

let a = (
  <Div id="a">
    123
    <div>
      <b>abc</b>
      <b></b>
      <b></b>
    </div>
  </Div>
);
//document.body.append(a);
a.mountTo(document.body);
