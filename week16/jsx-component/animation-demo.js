import { TimeLine, Animation } from "./animation.js";
import { linear, ease, easeIn, easeOut, easeInOut } from "./ease.js";

let tl = new TimeLine();
let aa = new Animation(document.getElementById("el").style, "transform", 0, 500, 2000, 2000, ease, (v) => `translateX(${v}px)`);

tl.start();

setTimeout(() => {
  tl.add(aa);
  let el2 = document.getElementById("el2");
  el2.style.transition = "transform 2s ease";
  // el2.style.animationDelay ='2s';
  el2.style.transitionDelay = "2s";
  el2.style.transform = `translateX(500px)`;
}, 300);

document.getElementById("pauseBtn").addEventListener("click", function (event) {
  tl.pause();
});

document.getElementById("resumeBtn").addEventListener("click", function (event) {
  tl.resume();
});

document.getElementById("resetBtn").addEventListener("click", function (event) {
  tl.reset();
});
