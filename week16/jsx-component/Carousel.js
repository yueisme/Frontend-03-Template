import { createElement, Component, STATE, ATTRIBUTES } from "./framework.js";
import { enableGesture } from "./gesture.js";
import { TimeLine, Animation } from "./animation.js";
import { ease } from "./ease.js";

export { STATE, ATTRIBUTES } from "./framework.js";

class Carousel extends Component {
  constructor() {
    super();

    this.animationDuration = 500;
    this.intervalTime = 3000;
  }

  get width() {
    return Number(window.getComputedStyle(this.root).width.match(/\d+/)[0]);
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for (let p of this[ATTRIBUTES].source) {
      let child = document.createElement("div");
      child.style.backgroundImage = `url(${p.img})`;
      this.root.append(child);
    }
    let children = this.root.children;
    this[STATE].position = 0; //同currentIndex，表示当前图片
    let t = 0;
    let ax = 0; //动画的位移
    let intervalId;
    enableGesture(this.root);
    let timeline = new TimeLine();
    timeline.start();
    this.root.addEventListener("start", (sEvent) => {
      timeline.pause();
      clearInterval(intervalId);
      if (t === 0) {
        return;
      }
      let now = Date.now();

      let progress = (now - t) / this.animationDuration;
      // 减去this.width得出剩余的距离
      ax = ease(progress) * this.width - this.width;
    });
    this.root.addEventListener("tap", (tapEvent) => {
      let position = this[STATE].position;
      this.triggerEvent("click", {
        position,
        src: this[ATTRIBUTES].source[position].img,
        href: this[ATTRIBUTES].source[position].url,
      });
      timeline.resume();
      intervalId = setInterval(nextPicture, this.intervalTime);
    });

    this.root.addEventListener("pan-move", (panEvent) => {
      let x = panEvent.clientX - panEvent.startX - ax;
      //定位当前图片，超过500px才算一张图
      let current = this[STATE].position - (x - (x % this.width)) / this.width;
      //console.log((x - (x % this.width)) / this.width);
      console.log(current);
      //给图片移动，范围是current图片和前后2张图
      for (let offset of [-1, 0, 1]) {
        //求出dom的index位置
        let pos = current + offset;
        pos = ((pos % children.length) + children.length) % children.length;

        let movePx = -pos * this.width + offset * this.width + (x % this.width);
        children[pos].style.transition = `none`;
        children[pos].style.transform = `translateX(${movePx}px)`;
      }
    });
    this.root.addEventListener("end", (panEndEvent) => {
      timeline.reset();
      timeline.start();
      intervalId = setInterval(nextPicture, this.intervalTime);
      let x = panEndEvent.clientX - panEndEvent.startX - ax;
      let current = this[STATE].position - (x - (x % this.width)) / this.width;
      //滑动方向
      let direction = Math.round((x % this.width) / this.width);

      if (panEndEvent.isFlick) {
        if (panEndEvent.velocity < 0) {
          direction = Math.ceil((x % this.width) / this.width);
        } else {
          direction = Math.floor((x % this.width) / this.width);
        }
      }

      for (let offset of [-1, 0, 1]) {
        //求出dom的index位置
        let pos = current + offset;
        pos = ((pos % children.length) + children.length) % children.length;

        let movePx = -1 * pos * this.width + offset * this.width + (x % this.width);
        let endPx = -1 * pos * this.width + offset * this.width + direction * this.width;
        children[pos].style.transition = `none`;
        //动画稍微加速了一点
        timeline.add(new Animation(children[pos].style, "transform", movePx, endPx, this.animationDuration * 0.7, 0, ease, (v) => `translateX(${v}px)`));
      }
      t = Date.now();
      this[STATE].position = this[STATE].position - (x - (x % this.width)) / this.width - direction;
      this[STATE].position = ((this[STATE].position % children.length) + children.length) % children.length;
      this.triggerEvent("change", { position: this[STATE].position });
    });

    let nextPicture = () => {
      let children = this.root.children;
      let nextIndex = (this[STATE].position + 1) % children.length;
      let current = children[this[STATE].position];
      let next = children[nextIndex];
      next.style.transition = "none";
      //把下一张图片放在右边，nextIndex*100表示原本布局中的位置
      next.style.transform = `translateX(${this.width - nextIndex * this.width}px)`;

      t = Date.now();
      timeline.add(new Animation(current.style, "transform", -1 * this[STATE].position * this.width, -1 * this.width - this[STATE].position * this.width, this.animationDuration, 0, ease, (v) => `translateX(${v}px)`));
      timeline.add(new Animation(next.style, "transform", this.width - nextIndex * this.width, -1 * nextIndex * this.width, this.animationDuration, 0, ease, (v) => `translateX(${v}px)`));
      this.triggerEvent("change", { position: this[STATE].position });
      this[STATE].position = nextIndex;
    };
    intervalId = setInterval(nextPicture, this.intervalTime);

    return this.root;
  }
}

export default Carousel;
