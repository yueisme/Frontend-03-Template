const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("addtime");
const PAUSE_START = Symbol("PAUSE_START");
const PAUSE_TIME = Symbol("PAUSE_TIME");
const STATE = Symbol("STATE");

export class TimeLine {
  constructor() {
    this[STATE] = "init";
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
  }

  start() {
    if (this[STATE] !== "init") {
      return;
    }
    this[STATE] = "started";
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      let now = Date.now();
      for (const animation of this[ANIMATIONS]) {
        let t;
        if (this[START_TIME].get(animation) < startTime) {
          t = now - startTime;
        } else {
          t = now - this[START_TIME].get(animation);
        }
        //减去延迟时间
        t = t - animation.delay;
        //减去暂停的时间
        t = t - this[PAUSE_TIME];
        //最后一帧，t参数美化
        if (animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          t = animation.duration;
        }
        if (t < 0) {
          continue;
        }
        animation.recive(t);
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    };
    this[TICK]();
  }

  pause() {
    if (this[STATE] !== "started") {
      return;
    }
    this[STATE] = "paused";
    //记录暂停的时间戳
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }

  resume() {
    if (this[STATE] !== "paused") {
      return;
    }
    this[STATE] = "started";
    //恢复动画的时间减去暂停的时间，得出已暂停的时间
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  }

  reset() {
    this.pause();
    this[STATE] = "init";
    delete this[PAUSE_START];
    delete this[PAUSE_TIME];
    delete this[TICK_HANDLER];
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    //this.start();
  }

  add(animation, startTime = Date.now()) {
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, startTime);
  }
};

export class Animation {
  constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
    timingFunction = timingFunction || ((v) => v);
    template = template || ((v) => v);
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.delay = delay;
    this.timingFunction = timingFunction;
    this.template = template;
    this.tickCounter = [];
  }
  recive(time) {
    //console.log(time);
    this.tickCounter.push(time);
    // if (time >= this.duration) {
    //   console.log("tick运行了%d次", this.tickCounter.length);
    // }

    let progress = this.timingFunction(time / this.duration);
    let range = this.endValue - this.startValue;
    this.object[this.property] = this.template(this.startValue + range * progress);
    //debugger;
  }
};
