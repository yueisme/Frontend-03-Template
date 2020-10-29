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

        /*
        x是鼠标滑动距离
        (x % this.width) 表示显示的图片被移动的距离
        (x - (x % this.width)) 把距离按宽度(500)做一个刻度，用这个刻度除去宽度求出移动了几个图片的距离
        (x - (x % this.width)) / this.width 表示移动了几个图片的距离
            
        */
        //current代表组件当前的图片
        let current = this.position - (x - (x % this.width)) / this.width;
        //console.log((x - (x % this.width)) / this.width);
        console.log(current);
        //给图片移动，范围是current图片和前后2张图
        for (let offset of [-2, -1, 0, 1, 2]) {
          //求出dom的index位置
          let pos = current + offset;
          pos = (pos + children.length) % children.length;
          //patch BUG
          pos = ((pos % children.length) + children.length) % children.length;

          let movePx = -pos * this.width + offset * this.width + (x % this.width);
          children[pos].style.transition = `none`;
          children[pos].style.transform = `translateX(${movePx}px)`;
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
          //只滑动2张图
          let num = -1 * Math.sign(Math.round(upX / this.width) - upX + (this.width / 2) * Math.sign(upX));
          if (Math.abs(upX) > this.width) {
            num = num * -1;//patch BUG
          }
          for (let offset of [0, num]) {
            let pos = this.position + offset;
            pos = (pos + children.length) % children.length;
            //patch BUG
            pos = ((pos % children.length) + children.length) % children.length;
            children[pos].style.transition = ``;
            //children[pos].style.transform = `translateX(${-this.position * this.width}px)`;
            children[pos].style.transform = `translateX(${-pos * this.width + offset * this.width}px)`;
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
