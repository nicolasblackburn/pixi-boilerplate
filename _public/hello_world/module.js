export function info() {
  return {
    name: "Hello World",
    version: "1.0.0",
    description: "",
    license: "",
    author: ""
  }
}

export function main() {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.pixelDeviceResolution
  });
  document.body.appendChild(app.view);

  function katana(concat, empty, x, stop, 
    next) {
    let result = empty;
    while (!stop(x)) {
      result = concat(x, result);
      x = next(x);
    }
    return result;
  }

  function katana2(concat, empty, x, stop, 
    uncons) {
    let result = empty;
    while (!stop(x)) {
      const [first, rest] = uncons(x);
      result = concat(first, result);
      x = rest;
    }
    return result;
  }

  const parse = expr => {
    
  };
}
