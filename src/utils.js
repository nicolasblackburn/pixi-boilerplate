export function boundsEqual(bounds1, bounds2) {
  return bounds1.x === bounds2.x &&
    bounds1.y === bounds2.y &&
    bounds1.width === bounds2.width &&
    bounds1.height === bounds2.height;
}

export function load(loader, assets) {
  return () => new Promise((resolve, reject) => {
    Object.entries(assets).forEach(([id, asset]) => loader.add(id, asset));
    loader.onError.once(reject);
    loader.load(resolve);
  });
}

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