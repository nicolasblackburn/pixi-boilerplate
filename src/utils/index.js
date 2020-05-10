import { Texture } from "pixi.js";

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

const { PI, atan2 } = Math;
const PI2 = 2 * PI;
export const DIRECTION_KEYWORD_MAP = ['right', 'down', 'down', 'down', 'left', 'up', 'up', 'up'];

export function discreteAngle(samplesCount, {x, y}) {
  return ((atan2(y, x) / PI2 * samplesCount + samplesCount + 1 / 2) % samplesCount | 0);
}

export function getDirectionKeyword(direction) {
  return DIRECTION_KEYWORD_MAP[discreteAngle(8, direction)];
}