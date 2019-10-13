/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number
 * }} Rectangle
 */

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
 * @param {PIXI.Loader} loader 
 * @param {{[key: string]: string}} assets 
 */
export function load(loader, assets) {
  return () => new Promise((resolve, reject) => {
    Object.entries(assets).forEach(([id, asset]) => loader.add(id, asset));
    loader.onError.once(reject);
    loader.load(resolve);
  });
}

/**
 * 
 * @param {PIXI.Ticker} ticker 
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