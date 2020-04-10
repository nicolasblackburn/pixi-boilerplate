export function add(...points) {
  return new PIXI.Point(...points.reduce((sum, {x, y}) => [sum[0] + x, sum[1] + y], [0, 0]));
}

export function sub({x, y}, ...points) {
  return new PIXI.Point(...points.reduce((sum, {x, y}) => [sum[0] - x, sum[1] - y], [x, y]));
}

export function mult(a, {x, y}) {
  return new PIXI.Point(a * x, a * y);
}

export function abs({x, y}) {
  return Math.sqrt(x * x + y * y);
}

export function scalar({x: x1, y: y1}, {x: x2, y: y2}) {
  return x1 * x2 + y1 * y2;
}

export function box({x, y, width, height}, {x: x1, y: y1}) {
  return new PIXI.Point(
    Math.max(x, Math.min(x + width, x1)),
    Math.max(y, Math.min(y + height, y1))
  );
}

export function clamp(r, p) {
  const n = abs(p);
  if (n < r) {
    return p;
  } else {
    return mult(r, norm(p));
  }
}

export function neg({x, y}) {
  return new PIXI.Point(-x, -y);
}

export function floatEqual(x, y, epsilon) {
  return Math.abs(x - y) < (epsilon || 0.0000001);
}

export function norm({x, y}) {
  const n = abs({x, y});
  if (floatEqual(0, n)) {
    return new PIXI.Point(0, 0);
  } else {
    return new PIXI.Point(x / n, y / n);
  }
}