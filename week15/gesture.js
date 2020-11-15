// let element = document.documentElement;

export class Listener {
  constructor(element, recognizer) {
    let contexts = new Map();
    let isListeningMouse = false;

    element.addEventListener("mousedown", (downEvent) => {
      let context = Object.create(null);
      contexts.set("mouse" + (1 << downEvent.button), context);
      recognizer.start(downEvent, context);
      let mousemove = (moveEvent) => {
        let button = 1;
        while (button <= moveEvent.buttons) {
          //通过与运算判断某一位按键是否按下，如果按下则运算结果大于0使得if条件成立
          if (button & moveEvent.buttons) {
            //MouseEvent.buttons的顺序和MouseEvent.button不一致
            let key = button;
            if (button === 2) {
              key = 4;
            } else if (button === 4) {
              key = 2;
            }
            let context = contexts.get("mouse" + key);
            recognizer.move(moveEvent, context);
          }
          button = button << 1; //移位，用于下一位判断
        }
      };
      let mouseup = (upEvent) => {
        let key = "mouse" + (1 << upEvent.button);
        let context = contexts.get(key);
        recognizer.end(upEvent, context);
        contexts.delete(key);
        if (upEvent.buttons === 0) {
          document.removeEventListener("mousemove", mousemove);
          document.removeEventListener("mouseup", mouseup);
          isListeningMouse = false;
        }
      };
      if (!isListeningMouse) {
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
        isListeningMouse = true;
      }
    });

    element.addEventListener("touchstart", (tsEvent) => {
      for (const touch of tsEvent.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        //console.log(touch);
        recognizer.start(touch, context);
      }
    });
    element.addEventListener("touchmove", (tmEvent) => {
      for (const touch of tsEvent.changedTouches) {
        //console.log(touch);
        let context = contexts.get(touch.identifier);
        recognizer.move(touch, context);
      }
    });
    element.addEventListener("touchend", (teEvent) => {
      for (const touch of tsEvent.changedTouches) {
        //console.log(touch);
        let context = contexts.get(touch.identifier);
        recognizer.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });
    element.addEventListener("touchcancel", (teEvent) => {
      for (const touch of tsEvent.changedTouches) {
        //console.log(touch);
        let context = contexts.get(touch.identifier);
        recognizer.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    });
  }
};

export class Recognizer {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
  test = () => {
    return "aa";
  };
  start(point, context) {
    //console.log("start", point);
    context.isTap = true;
    context.isPan = false;
    context.isPress = false;
    context.startX = point.clientX;
    context.startY = point.clientY;
    context.points = [{ t: Date.now(), clientX: point.clientX, clientY: point.clientY }];
    context.timeoutId = setTimeout(() => {
      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      context.timeoutId = null;
      this.dispatcher.dispatch("press-start", {});
    }, 500);
  }

  move(point, context) {
    let dx = point.clientX - context.startX;
    let dy = point.clientY - context.startY;
    const trigger_distance = Math.pow(window.devicePixelRatio * 5, 2);
    if (!context.isPan && dx ** 2 + dy ** 2 > trigger_distance) {
      context.isTap = false;
      context.isPan = true;
      context.isPress = false;
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      //console.log("pan-start");
      this.dispatcher.dispatch("pan-start", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
      clearTimeout(context.timeoutId);
    }
    if (context.isPan) {
      // console.log(dx, dy);
      // console.log("pan-move");
      this.dispatcher.dispatch("pan-move", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
      //debugger;
    }
    let now = Date.now();
    context.points = context.points.filter((point) => now - point.t < 500);
    context.points.push({ t: Date.now(), clientX: point.clientX, clientY: point.clientY });
    //console.log("move", point);
  }

  end(point, context) {
    if (context.isTap) {
      //console.log("tap");
      clearTimeout(context.timeoutId);
      this.dispatcher.dispatch("tap", {});
      return;
    }

    if (context.isPress) {
      // console.log("press-end");
      this.dispatcher.dispatch("press-end", {});
      return;
    }
    let now = Date.now();
    context.points = context.points.filter((point) => now - point.t < 500);
    let d, v;
    if (!context.points.length) {
      v = 0;
    } else {
      d = Math.sqrt((point.clientX - context.points[0].clientX) ** 2 + (point.clientY - context.points[0].clientY) ** 2);
      v = d / (now - context.points[0].t);
    }

    if (v > 1.5) {
      // console.log("flick");
      context.isFlick = true;
      this.dispatcher.dispatch("flick", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v,
      });
    } else {
      context.isFlick = false;
    }
    // console.log("gesture speed", v);
    if (context.isPan) {
      // console.log("pan-end");
      this.dispatcher.dispatch("pan-end", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
      });
    }
    //console.log("end", point);
  }

  cancel(point, context) {
    // console.log("cancel", point);
    clearTimeout(context.timeoutId);
    this.dispatcher.dispatch("cancel", {});
  }
};

export class Dispatcher {
  constructor(element) {
    this.element = element;
  }
  dispatch(type, properties) {
    let event = new Event(type);
    Object.assign(event, properties);
    // for (const key in properties) {
    //   event[key] = properties[key];
    // }
    this.element.dispatchEvent(event);
  }
};

export function enableGesture(element) {
  return new Listener(element, new Recognizer(new Dispatcher(element)));
};
