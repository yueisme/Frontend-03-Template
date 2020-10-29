import { createElement, Component } from "./framework";

class Carousel extends Component {
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    //console.log(arguments);
    this.attributes[name] = value;
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for (let p of this.attributes.source) {
      let child = document.createElement("div");
      child.style.backgroundImage = `url(${p})`;
      this.root.append(child);
    }

    this.position = 0; //同currentIndex，表示当前图片
    this.root.addEventListener("mousedown", (downEvent) => {
      let startX = downEvent.clientX;
      let children = this.root.children;
      this.width = Number(window.getComputedStyle(this.root).width.match(/\d+/)[0]);

      let move = (moveEvent) => {
        let x = moveEvent.clientX - startX;
        
        for (const child of children) {
          child.style.transition = `none`;
          child.style.transform = `translateX(${-this.position * this.width + x}px)`;
        }
      };
      document.addEventListener("mousemove", move);
      document.addEventListener(
        "mouseup",
        (upEvent) => {
          //debugger;

          let upX = upEvent.clientX - startX;
          //根据拖动的距离定位到图片(可以一次拖到很多张位置)
          this.position = this.position - Math.round(upX / this.width);
          console.log(this.position);
          for (const child of children) {
            child.style.transition = ``;
            child.style.transform = `translateX(${-this.position * this.width}px)`;
          }
          document.removeEventListener("mousemove", move);
        },
        { once: true }
      );
    });

    /*
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
*/
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
