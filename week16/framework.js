export function createElement(type, attributes, ...children) {
  console.log("type", type);
  let element;
  if (typeof type === "string") {
    element = new ElementWrapeer(type);
  } else {
    element = new type();
  }
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  let processChildren = (children) => {
    for (let child of children) {
      if (typeof child === "object" && child instanceof Array) {
        processChildren(child);
        continue;
      }
      if (typeof child === "string") {
        //child = document.createTextNode(child);
        child = new TextWrapeer(child);
      }
      element.append(child);
    }
  };
  processChildren(children);

  return element;
}

export const STATE = Symbol("STATE");
export const ATTRIBUTES = Symbol("ATTRIBUTES");

export class Component {
  constructor(type) {
    //this.root =this.render();
    this[ATTRIBUTES] = Object.create(null);
    this[STATE] = Object.create(null);
  }
  render() {
    return this.root;
  }
  setAttribute(name, value) {
    //this.root.setAttribute(name, value);
    this[ATTRIBUTES][name] = value;
  }
  append(child) {
    if (typeof child === "object" && child instanceof Array) {
      // work same as line 14-17
      for(let c of child){
        c.mountTo(this.root);
      }
      return;
    }
    child.mountTo(this.root);
  }
  mountTo(parent) {
    if (!this.root) {
      this.render();
    }
    parent.append(this.root);
  }
  triggerEvent(type, args) {
    let e = this[ATTRIBUTES]["on".concat(type.replace(/^[\s\S]/, (c) => c.toUpperCase()))];
    e && e(new CustomEvent(type, { detail: args }));
  }
}

// for html element
class ElementWrapeer extends Component {
  constructor(type) {
    if (!new.target) {
      throw new Error("ElementWrapeer must be call by `new ElementWrapeer(type)`");
    }
    super();
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
}

// for html text
class TextWrapeer extends Component {
  constructor(content) {
    if (!new.target) {
      throw new Error("TextWrapeer must be call by `new TextWrapeer(type)`");
    }
    super();
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
