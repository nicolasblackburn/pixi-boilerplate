import { Texture } from "pixi.js";

/**
* 
* @param {Rectangle} rectangle1 
* @param {Rectangle} rectangle2 
*/
export function rectangleEqual(rectangle1, rectangle2) {
  return rectangle1.x === rectangle2.x &&
    rectangle1.y === rectangle2.y &&
    rectangle1.width === rectangle2.width &&
    rectangle1.height === rectangle2.height;
}

/**
* 
* @param {Loader} loader 
* @param {{[key: string]: string}} assets 
*/
export function load(loader, assets) {
  return new Promise((resolve, reject) => {
    for (const [id, url] of Object.entries(assets)) {
      loader.add(id, url);
    }
    loader.onError.once(reject);
    loader.load(resolve);
  });
}

/**
* 
* @param {Ticker} ticker 
* @param {number} ms 
* @param {() => void} callback 
* @returns {() => void} clearTimeout
*/
export function timeout(ticker, ms, callback) {
  const onUpdate = () => {
    if (ms > 0) {
      ms -= ticker.elapsedMS;
      if (ms <= 0) {
        ticker.remove(onUpdate);
        callback();
      }
    }
  };
  ticker.add(onUpdate);
  return () => ticker.remove(onUpdate);
}

export function hasEnterCallback(obj) {
  return typeof obj.enter === "function";
}

export function hasExitCallback(obj) {
  return typeof obj.exit === "function";
}

export function hasResizeCallback(obj) {
  return typeof obj.resize === "function";
}

export function hasPreloadCallback(obj) {
  return typeof obj.preload === "function";
}

export function hasLoadCallback(obj) {
  return typeof obj.load === "function";
}

export function hasPostLoadCallback(obj) {
  return typeof obj.postLoad === "function";
}

export function hasUpdateCallback(obj) {
  return typeof obj.update === "function";
}

export function hasErrorCallback(obj) {
  return typeof obj.error === "function";
}

export function parseSVGPath(path) {
  const tokens = path.split(/[\s\t\r\n]*,[\s\t\r\n]*|[\s\t\r\n]+/);
  const helper = (last, tokens, result) => {
    if (!tokens.length) {
      return result;
    } else if ("M" === tokens[0]) {
      const [x, y] = tokens.slice(1, 3).map(x => parseFloat(x));
      const rest = tokens.slice(3);
      return helper({x, y}, rest, result.concat([{x, y}]));
    } else if ("L" === tokens[0]) {
      const [x, y] = tokens.slice(1, 3).map(x => parseFloat(x));
      const rest = tokens.slice(3);
      return helper({x, y}, rest, result.concat([{x, y}]));
    } else if ("V" === tokens[0]) {
      const [x, y] = [last.x, parseFloat(tokens[1])];
      const rest = tokens.slice(2);
      return helper({x, y}, rest, result.concat([{x, y}]));
    } else if ("H" === tokens[0]) {
      const [x, y] = [parseFloat(tokens[1]), last.y];
      const rest = tokens.slice(2);
      return helper({x, y}, rest, result.concat([{x, y}]));
    } else if ("Z" === tokens[0]) {
      return result;
    } else {
      const [x, y] = tokens.slice(0, 2).map(x => parseFloat(x));
      const rest = tokens.slice(2);
      return helper({x, y}, rest, result.concat([{x, y}]));
    }
  }
  return helper({x: 0, y: 0}, tokens, []);
}

export function map(f, o) {
  if (o && typeof o.map === 'function') {
    return o.map(f);
  } else {
    const u = {};
    for (const k in o) {
      u[k] = f(o[k], k);
    }
    return u;
  }
}

export function join(u, v) {
  if (Array.isArray(u) && Array.isArray(v)) {
    const w = [];
    for (let i = 0; i < u.length && i < v.length; i++) {
      w[i] = [u[i], v[i]];
    }
    return w;
  } else {
    const w = {};
    for (const k in u) {
      if (v[k] !== undefined) {
        w[k] = [u[k], v[k]];
      }
    }
    for (const k in v) {
      if (u[k] !== undefined) {
        w[k] = [u[k], v[k]];
      }
    }
    return w;
  }
}

export function papply(f, ...args) {
  return f.bind(null, ...args);
}

export function compose(g, f, ...rest) {
  if (rest.length === 0) {
    return function(...xs) {
      return g(f(...xs));
    };
  } else {
    return compose(g, compose(f, ...rest));
  }
}

export function pipe(x, f, ...rest) {
  if (rest.length === 0) {
    return f(x);
  } else {
    return pipe(f(x), ...rest);
  }
}

export function add(...args) {
  return args.reduce((a, b) => a + b, 0);
}

export function sub(a, ...args) {
  return a - add(...args);
}

export function mult(...args) {
  return args.reduce((a, b) => a * b, 1);
}

export function div(a, ...args) {
  return a / mult(...args);
}

export function notify(listeners, fnName, ...params) {
  for (const listener of listeners) {
    if (typeof listener[fnName] === 'function') {
      listener[fnName](...params);
    }
  }
}

export function textureFrom(id) {
  if (id instanceof Texture) {
    return id;
  } else if (id === null) {
    return Texture.EMPTY;
  } else {
    return Texture.from(id);
  }
}

export function applyFrame(frame, sprite) {
  for (const [k, v] of Object.entries(frame)) {
    if (k === 'texture') {
      sprite[k] = textureFrom(v);
    } else if (typeof v !== 'number') {
      applyFrame(v, sprite[k]);
    } else {
      sprite[k] = v;
    }
  }
}

export function frameAnimation(sprite, options) {
  const {frames, frameDuration, loop,  map, duration: _, ...optionsRest} = {
    frameDuration: 1 / 80,
    duration: 0,
    loop: false,
    map: x => x,
    ...options
  };

  let startTime;

  const animation = new Animation({
    onUpdate: (time, complete) => {
      if (startTime === undefined) {
        startTime = time;
      }
      if (time - startTime >= frames.length / frameDuration && !loop) {
        applyFrame(map(frames[frames.length - 1]), sprite);
        complete();

      } else {
        const frame = parseInt(time * frameDuration) % frames.length;
        applyFrame(map(frames[frame]), sprite);
      }
    },
    paused: true,
    ...optionsRest
  });

  return animation;
}