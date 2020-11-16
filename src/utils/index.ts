import { Loader } from "pixi-boilerplate/loader/Loader";
import { Texture } from "pixi-boilerplate/renderer/Texture";
import { Point } from "pixi-boilerplate/geom";
import { Ticker } from "pixi-boilerplate/animation/Ticker";

let qs;
export function queryString() {
  if (!qs) {
    qs = window.location.search.slice(1).split("&").reduce((qs, kv) => {
      const [k, v] = decodeURIComponent(kv).split("=");
      if (v === undefined) {
        qs[k] = k;
      } else {
        qs[k] = v;
      }
      return qs;
    }, {});
  }
  return qs;
}

/**
* 
* @param {Loader} loader 
* @param {{[key: string]: string}} assets 
*/
export function load(loader: Loader, assets: {[key: string]: string}) {
  return new Promise((resolve, reject) => {
    for (const [id, url] of Object.entries(assets)) {
      loader.add(id, url);
    }
    loader.onError.once(reject);
    loader.load((_, resources) => resolve(resources));
  });
}

/**
* 
* @param {Ticker} ticker 
* @param {number} ms 
* @param {() => void} callback 
* @returns {() => void} clearTimeout
*/
export function timeout(ticker: Ticker, ms: number, callback: (...args: any[]) => any) {
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

export function parseSVGPath(path: string) {
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

export function notify(listeners: any, fnName: string, ...params: any[]) {
  for (const listener of listeners) {
    if (typeof listener[fnName] === 'function') {
      listener[fnName](...params);
    }
  }
}

export function textureFrom(id: any) {
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

export function discreteAngle(samplesCount: number, {x, y}: Point) {
  return ((atan2(y, x) / PI2 * samplesCount + samplesCount + 1 / 2) % samplesCount | 0);
}

export function getDirectionKeyword({x, y}: Point) {
  let angle = atan2(y, x) / PI2;
  if (angle < 0) {
    angle += 1;
  }
  if (0.125 <= angle && angle <= 0.375) {
    return 'down';
  } else if (0.375 < angle && angle < 0.625) {
    return 'left';
  }  else if (0.625 <= angle && angle <= 0.875) {
    return 'up';
  } else {
    return 'right';
  }
}

const TEXT_DATA = {}; 
let LOCALE = 'en';

export function setLocale(locale: string) {
  LOCALE = locale;
}

export function setTextData(data: {[k: string]: string}) {
  if (TEXT_DATA[LOCALE] === undefined) {
    TEXT_DATA[LOCALE] = {};
  }
  Object.assign(TEXT_DATA[LOCALE], data);
}

export function getText(text: string) {
  if (TEXT_DATA[LOCALE] !== undefined && TEXT_DATA[LOCALE][text] !== undefined) {
    return TEXT_DATA[LOCALE][text];
  } else {
    return text;
  }
}

export function weightedRandom(weights: number[]): number;
export function weightedRandom<T>(outcomes: {value: T, weight: number}[]): T;
export function weightedRandom<T>(outcomes: (number | {value: T, weight: number})[]): T {
  if (!outcomes.length) {
    return;
  } 

  if (typeof outcomes[0] === 'number') {
    let sum = 0;
    for (const weight of outcomes as number[]) {
      sum += weight;
    }
    const rnd = Math.random() * sum | 0;
    let outcomeIndex = 0;
    let outcomeWeight = outcomes[outcomeIndex] as number;
    while (rnd >= outcomeWeight) {
      outcomeIndex++;
      outcomeWeight += outcomes[outcomeIndex] as number;
    }
    return outcomeIndex as any;
  } else {
    let sum = 0;
    for (const entry of outcomes as {weight: number}[]) {
      sum += entry.weight;
    }
    const rnd = Math.random() * sum | 0;
    let outcomeIndex = 0;
    let outcomeWeight = (outcomes[outcomeIndex] as {weight: number}).weight;
    while (rnd >= outcomeWeight) {
      outcomeIndex++;
      outcomeWeight += (outcomes[outcomeIndex] as {weight: number}).weight;
    }
    return (outcomes[outcomeIndex] as {value: T}).value;
  }
}

export function sign(n: number) {
  return n < 0 ? -1 : n === 0 ? 0 : 1;
}