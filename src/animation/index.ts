import { Animation } from "pixi-boilerplate/animation/Animation";
import { textureFrom } from "pixi-boilerplate/utils";

export function lerp(from: any, to: any, t: number) {
  const t1 = typeof from;
  const t2 = typeof to;
  if (t1 === "number" && t1 === t2 && isFinite(from) && isFinite(to)) {
    return (1 - t) * from + t * to;
  } else {
    return t < 1 ? from : to;
  }
}

export function olerp(from: any, to: any, t: number) {
  //return map(f => f(t), map(([v0, v1]) => lerp(v0, v1, t), join(from, to)));
}

export function interpolate(...points: (number | number[])[]) {
  return t => {
    let value = 0;
    for (let i = 0; i < points.length; i++) {
      const point_a = points[i];
      const [ti, xi] = Array.isArray(point_a) ? point_a : [point_a, point_a];
      let term = xi;
      for (let j = 0; j < points.length; j++) {
        if (j !== i) {
          const [tj] = points[j];
          term *= (t - tj) / (ti - tj);
        }
      }
      value += term;
    }
    return value;
  };
}

export function quadIn(t: number) {
  return t * t;
}

export function quadOut(t: number) {
  return 1 - (t - 1) * (t - 1);
}

export function quadInOut(t: number) {
  if (t < 0.5) {
      return t * t * 2;
  } else {
      return 1 - (t - 1) * (t - 1) * 2;
  }
}

export function bezier(p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}, p4: {x: number, y: number}, t: number) {
    const t1 = Math.pow(1 - t, 3);
    const t2 = 3 * Math.pow(1 - t, 2) * t;
    const t3 = 3 * (1 - t) * Math.pow(t, 2);
    const t4 = Math.pow(t, 3);
    return {
        x: t1 * p1.x + t2 * p2.x + t3 * p3.x + t4 * p4.x,
        y: t1 * p1.y + t2 * p2.y + t3 * p3.y + t4 * p4.y
    };
}

export function applyFrame<T extends any>(frame: {[k: string]: any}, target: T): T {
  for (const [k, v] of Object.entries(frame)) {
    if (k === 'texture') {
      target[k] = textureFrom(v);
    } else if (typeof v !== 'number') {
      applyFrame(v, target[k]);
    } else {
      target[k] = v;
    }
  }
  return target;
}

export function frameAnimation(target: {[k: string]: any}, options: any) {
  const {frames, speed, loop,  map, duration: _, ...optionsRest}: any = {
    speed: 1,
    duration: 0,
    loop: false,
    map: x => x,
    ...options
  };

  let startTime;
  const frameDuration = 1000 / 60 / speed;

  const animation = new Animation({
    onUpdate: (time, complete) => {
      if (startTime === undefined) {
        startTime = time;
      }
      if (time - startTime >= frames.length * frameDuration && !loop) {
        applyFrame(map(frames[frames.length - 1]), target);
        complete && complete();

      } else {
        const frame = (time / frameDuration | 0) % frames.length;
        applyFrame(map(frames[frame]), target);
      }
    },
    paused: true,
    ...optionsRest
  });

  return animation;
}