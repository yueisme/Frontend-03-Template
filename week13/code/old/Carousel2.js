import { createElement, Component } from "./framework";

class Carousel extends Component {
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    console.log(arguments);
    this.attributes[name] = value;
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for (let p of this.attributes.source) {
      let child = document.createElement("div");
      //child.setAttribute("src", p);
      child.style.backgroundImage = `url(${p})`;
      this.root.append(child);
    }
    //return this.root;
    this.currentIndex = 0;
    setInterval(() => {
      let children = this.root.children;
      let nextIndex = (this.currentIndex + 1) % children.length;
      let current = children[this.currentIndex];
      let next = children[nextIndex];
      next.style.transition = "none";
      //把下一张图片放在右边，nextIndex*100表示原本布局中的位置
      next.style.transform = `translateX(${100 - nextIndex * 100}%)`;
      setTimeout(() => {
        next.style.transition = "";
        //使当前图片移出，下一张图片移入
        current.style.transform = `translateX(${-100 - this.currentIndex * 100}%)`;
        next.style.transform = `translateX(${-1 * nextIndex * 100}%)`;
        this.currentIndex = nextIndex;
      }, 17);
    }, 3000);

    return this.root;
  }
  mountTo(parent) {
    parent.append(this.render());
  }
}
let source = ["./t.jpg", "./t2.jpg", "./drink.jpeg", "./p4.png"];
let a = <Carousel id="a" source={source}></Carousel>;
//document.body.append(a);
a.mountTo(document.body);
