import { create as create_observable } from "./observable";

export function lerp(from, to) {
  return t => (1 - t) * from + t * to;
}

export function quadIn(t) {
  return t * t;
}

export function quadOut(t) {
  return 1 - (t - 1) * (t - 1);
}

export function quadInOut(t) {
  if (t < 0.5) {
      return t * t * 2;
  } else {
      return 1 - (t - 1) * (t - 1) * 2;
  }
}

export function bezier(p1, p2, p3, p4) {
  return t => {
      const t1 = Math.pow(1 - t, 3);
      const t2 = 3 * Math.pow(1 - t, 2) * t;
      const t3 = 3 * (1 - t) * Math.pow(t, 2);
      const t4 = Math.pow(t, 3);
      return {
          x: t1 * p1.x + t2 * p2.x + t3 * p3.x + t4 * p4.x,
          y: t1 * p1.y + t2 * p2.y + t3 * p3.y + t4 * p4.y
      };
  };
}

export function timer(props) {
  props = {
    duration: Number.POSITIVE_INFINITY,
    ticker: new PIXI.Ticker(),
    autoplay: true,
    ...props
  };
  const state = {
    playing: props.autoplay,
    currentTime: 0
  };
  if (props.autoplay) {
    props.ticker.start();
  }
  const subject = create_observable(observer => {
      const update = deltaTime => {
        if (state.playing) {
          const lastTime = state.currentTime;
          const elapsedTime = lastTime + (deltaTime !== 0 ? props.ticker.deltaMS : 0);
          state.currentTime = Math.min(props.duration, elapsedTime);
          observer.next(state.currentTime);
          if (state.currentTime === props.duration) {
            state.playing = false;
            observer.complete({
              elapsedTime,
              deltaTime
            });
          }
        }
      }
      props.ticker.add(update);
      return () => props.ticker.remove(update);
  });
  const {clear, subscribe, then} = subject;
  const subjectB = {
    _props: props,
    _state: state,
    clear: () => {
      clear();
      state.playing = false;
      state.currentTime = 0;
      return subjectB;
    },
    play: () => {
      state.playing = true;
      return subjectB;
    },
    stop: () => {
      state.playing = false;
      return subjectB;
    },
    subscribe,
    then
  };
  Object.defineProperties(subjectB, {
    duration: {
      get: () => props.duration
    },
    playing: {
      get: () => state.playing
    },
    currentTime: {
      get: () => state.currentTime,
      set: currentTime => {
        state.currentTime = currentTime;
        props.ticker.update(0);
      }
    }
  });
  return subjectB;
}

export function to(target, duration, to, options) {
  return fromTo(target, duration, target, to, options);
}

export function from(target, duration, from, options) {
  return fromTo(target, duration, from, target, options);
}

export function fromTo(target, duration, from, to, options) {
  options = {
    ease: quadOut,
    error: () => { return; },
    complete: () => { return; },
    ...options
  }
  const fromB = {};
  const toB = {};
  Object.entries(from).forEach(([k, v]) => {
    if (to.hasOwnProperty(k)) {
      fromB[k] = v;
      toB[k] = to[k];
    }
  });
  const fns = Object.keys(fromB).map(k => [k, lerp(fromB[k], toB[k])]);
  const f = t => fns.map(([k, f]) => [k, f(t)]);
  const subject = timer({duration});
  subject.subscribe({
    next: t => 
      f(options.ease(t / duration)).forEach(([k, v]) => target[k] = v),
    error: options.error,
    complete: options.complete
  });
  return subject;
}

export function group(a, b, ...rest) {
  if (rest.length === 0) {
    const duration = Math.max(a.duration, b.duration)
  } else {

  }
}

export function concat() {

}

export function delay() {

}