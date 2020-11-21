import * as BezierEasing from './bezier-easing.js';

export function linear(v) {
  return v;
}

export let ease = BezierEasing(0.25, 0.1, 0.25, 1);
export let easeIn = BezierEasing(0.42, 0, 1, 1);
export let easeOut = BezierEasing(0, 0, 0.58, 1);
export let easeInOut = BezierEasing(0.42, 0, 0.58, 1);
