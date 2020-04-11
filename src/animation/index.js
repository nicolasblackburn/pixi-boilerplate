export function lerp(from, to) {
  return t => (1 - t) * from + t * to;
}

export function interpolate(...points) {
    return t => {
        let value = 0;
        for (let i = 0; i < points.length; i++) {
            const [ti, xi] = (typeof points[i] === "number" ? [points[i], points[i]] : points[i]);
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

export function fromTicker(ticker, options) {
  options = {
    autoplay: true,
    ...options
  };
  let observers = [];
  const forceUpdate = deltaMS => {
    state.currentTime += deltaMS;
    observers.forEach(({update}) => {
      if (update) {
        update(state.currentTime, deltaMS, state.currentTime);
      }
    });
  };
  const update = () => {
    if (state.playing) {
      forceUpdate(ticker.deltaMS);
    }
  };
  let unsubscribe;
  const state = {
    playing: options.autoplay,
    currentTime: 0
  };
  const animation = {
    play: () => state.playing = true,
    stop: () => state.playing = false,
    subscribe: observer => {
      observer = typeof observer === 'function' ? {update: observer} : observer;
      observers.push(observer);
      if (!unsubscribe) {
        ticker.add(update);
        unsubscribe = () => ticker.remove(update);
      }
      return {
        unsubscribe: () => observers.remove(observer)
      };
    },
    clear: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
      }
      observers = [];
    },
    get duration() {
      return Number.POSITIVE_INFINITY;
    },
    get playing() {
      return state.playing;
    },
    get currentTime() {
      return state.currentTime;
    },
    set currentTime(currentTime) {
      forceUpdate(currentTime - state.currentTime);
    }
  };
  return animation;
}

export function animate(duration, update, options) {
  options = {
    master: fromTicker(PIXI.Ticker.shared),
    ...options
  };
  stop = typeof duration === 'function' ? duration : t => t >= duration;
  duration = typeof duration === 'function' ? Number.POSITIVE_INFINITY : duration;
  const animation = {
    play: () => options.master.play(),
    stop: () => options.master.stop(),
    subscribe: observer => {
      observer = typeof observer === 'function' ? {update: observer} : observer;
      return options.master.subscribe({
        ...observer,
        update: (time, deltaTime) => {
          time = Math.min(duration, time);
          if (observer.update) {
            observer.update(time, deltaTime);
          }
          if (stop(time, deltaTime)) {
            animation.stop();
            if (observer.complete) {
              observer.complete(time, deltaTime);
            }
          }
        }
      });
    },
    clear: () => options.master.clear(),
    get duration() {
      return duration;
    },
    get playing() {
      return options.master.playing;
    },
    get currentTime() {
      return options.master.currentTime;
    },
    set currentTime(currentTime) {
      return options.master.currentTime = currentTime;
    }
  };
  animation.subscribe(update);
  return animation;
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
    ...options
  }
  const fns = Object.entries(from).reduce((fns, [k, v]) => {
    if (to.hasOwnProperty(k)) {
      fns.push([k, lerp(v, to[k])]);
    }
    return fns;
  }, []);
  const f = t => fns.map(([k, f]) => [k, f(t)]);
  return animate(duration, time => {
    f(options.ease(time / duration)).forEach(([k, v]) => target[k] = v);
  }, options);
}

export function group(...anims) {
  const duration = anims.reduce(
    (max, anim) => {
      anim.stop();
      return Math.max(
        max 
        , typeof anim.duration === 'function' ? 
          Number.POSITIVE_INFINITY : 
          anim.duration
      );
    }, 0
  );
  return animate(duration, (time) => {
    anims.forEach(anim => anim.currentTime = time);
  });
}

export function concat() {

}

export function delay() {

}