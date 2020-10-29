export function createElement(type, attributes, ...children) {
  let element;
  if (typeof type === "string") {
    element = new ElementWrapeer(type);
  } else {
    element = new type;
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
export class Component{
  constructor(type) {
    //this.root =this.render();
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
class ElementWrapeer extends Component{
  constructor(type) {
    this.root = document.createElement(type);
  }
  
}
class TextWrapeer  extends Component{
  constructor(content) {
    this.root = document.createTextNode(content);
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