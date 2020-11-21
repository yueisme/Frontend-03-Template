import { createElement, Component, STATE, ATTRIBUTES } from "./framework.js";

export { STATE, ATTRIBUTES } from "./framework.js";

class Button extends Component {
  constructor() {
    super();
  }

  render() {
    this.child = <button></button>;
    this.root = (<div>{this.child}</div>).render();
    return this.root;
  }

  append(c) {
    if (!this.child) {
      this.render();
    }
    this.child.append(c);
  }
}

export default Button;
