import { createElement, Component, STATE, ATTRIBUTES } from "./framework.js";
import { enableGesture } from "./gesture.js";

export { STATE, ATTRIBUTES } from "./framework.js";

class List extends Component {
  constructor() {
    super();
  }

  render() {
    this.child = this[ATTRIBUTES].data.map(this.template);
    this.root = (<ul>{this.child}</ul>).render();
    return this.root;
  }

  append(c) {
    this.template = c;
    this.render();
    //this.child.append(c);
  }
}

export default List;
