import { Transform } from "pixi.js";

export function point(x, y) {
  return {x, y};
}

export function pointsToSegments(pts) {
  const segments = [];
  for (let i = 0; i < pts.length; i++) {
    segments.push([pts[i], pts[(i + 1) % pts.length]]);
  }
  return segments;
}

export function pointCopy(p, q) {
  if (q === undefined) {
    return {x: p.x, y: p.y};
  } else {
    q.x = p.x;
    q.y = p.y;
    return q;
  }
}

export function pointToArray(p) {
  const {x, y} = p;
  return [x, y];
}

export function rectangle(x, y, width, height) {
  return {x, y, width, height};
}

export function rectangleToPoints(rect) {
  const {x, y, width, height} = rect;
  return [{x, y}, {x: x + width, y}, {x: x + width, y: y + height}, {x, y: y + height}];
}

/**
* 
* @param {Rectangle} rect0
* @param {Rectangle} rect1
*/
export function rectangleEqual(rect0, rect1) {
  return rect0.x === rect1.x &&
    rect0.y === rect1.y &&
    rect0.width === rect1.width &&
    rect0.height === rect1.height;
}

export function add(...points) {
  return point(...points.reduce((sum, {x, y}) => [sum[0] + x, sum[1] + y], [0, 0]));
}

export function sub({x, y}, ...points) {
  return point(...points.reduce((sum, {x, y}) => [sum[0] - x, sum[1] - y], [x, y]));
}

export function pwmult({x: x0, y: y0}, {x: x1, y: y1}) {
  return point(x0 * x1, y0 * y1);
}

export function mult(a, {x, y}) {
  return point(a * x, a * y);
}

export function addmult(a, u, ...vs) {
  return add(mult(a, u), ...vs);
}

export function abs({x, y}) {
  return Math.sqrt(x * x + y * y);
}

export function transform(matrix, p) {
  return point(
    matrix[0] * p.x + matrix[1] * p.y + matrix[2], 
    matrix[3] * p.x + matrix[4] * p.y + matrix[5], 
  );
}

export function transformIdentity() {
  return [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];
}

export function transformRotation(angle) {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
  return [
    cos, -sin, 0,
    sin, cos, 0,
    0, 0, 1
  ];
}

export function transformScale(factor) {
  return [
    factor, 0, 0,
    0, factor, 0,
    0, 0, 1
  ];
}

export function transformTranslate(x, y) {
  return [
    1, 0, x,
    0, 1, y,
    0, 0, 1
  ];
}

export function transformCompose(matrix0, matrix1) {
  return [
    matrix0[0] * matrix1[0] + matrix0[1] * matrix1[3],
    matrix0[0] * matrix1[1] + matrix0[1] * matrix1[4],
    matrix0[0] * matrix1[2] + matrix0[1] * matrix1[5] + matrix[2],
    matrix0[3] * matrix1[0] + matrix0[4] * matrix1[3],
    matrix0[3] * matrix1[1] + matrix0[4] * matrix1[4],
    matrix0[3] * matrix1[2] + matrix0[4] * matrix1[5] + matrix[5],
  ];
}

export function transformDet(matrix) {
  return matrix[0] * matrix[4] - matrix[1] * matrix[3];
}

export function transformInv(matrix) {
  const [a, b, c, d, e, f] = matrix;
  const det = transformDet(matrix);
  return [
    e / det, -b / det, (b * f - c * e) / det,
    -d / det, a / det, (c * d - a * f) / det,
    0, 0, 1
  ];
}

export function dot({x: x1, y: y1}, {x: x2, y: y2}) {
  return x1 * x2 + y1 * y2;
}

export function proj(u, v) {
  const n = abs(v);
  if (n === 0) {
    return point(0, 0);
  } else {
    return mult(dot(u, v) / n / n, v);
  }
}

export function box({x, y, width, height}, {x: x1, y: y1}) {
  return new Point(
    Math.max(x, Math.min(x + width, x1)),
    Math.max(y, Math.min(y + height, y1))
  );
}

export function pointsBounds(points) {
  const bounds = rectangle(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0, 0);
  for (const {x, y} of points) {
    bounds.x = Math.min(bounds.x, x);
    bounds.y = Math.min(bounds.y, y);
    bounds.width = Math.max(bounds.width, x - bounds.x);
    bounds.height = Math.max(bounds.height, y - bounds.y);
  }
  return bounds;
}

export function clampAbs(r, p) {
  const n = abs(p);
  if (n < r) {
    return p;
  } else {
    return mult(r, norm(p));
  }
}

export function clampRect(rect, p) {
  return point(
    Math.min(rect.x + rect.width, Math.max(rect.x, p.x)),
    Math.min(rect.y + rect.height, Math.max(rect.y, p.y)),
  );
}

export function neg({x, y}) {
  return new Point(-x, -y);
}

export function floatEqual(x, y, epsilon) {
  return Math.abs(x - y) < (epsilon || 0.0000001);
}

export function norm(p) {
  const {x, y} = p;
  const n = abs(p);
  if (floatEqual(0, n)) {
    return point(0, 0);
  } else {
    return point(x / n, y / n);
  }
}

export function ortho(p) {
  const {x, y} = p;
  return {x: y, y: -x};
}

export function orthonorm(p) {
  return norm(ortho(p));
}

export function findSupport(dir, pts) {
  const {x, y} = dir;
  let i = 0;
  let maxDist = pts[i].x * x + pts[i].y * y; 
  let maxDistIndex = i;
  while (i < pts.length - 1) {
    i++;
    const dist = pts[i].x * x + pts[i].y * y; 
    if (dist > maxDist) {
      maxDist = dist;
      maxDistIndex = i;
    }
  }
  return [pts[maxDistIndex], maxDistIndex, maxDist];
}

function absCross(p1, p2) {
  const {x: x0, y: y0} = p1;
  const {x: x1, y: y1} = p2;
  return x0 * y1 - x1 * y0;
}

export function cullInvisiblePoints(dir, pts) {
  const [sp, spi] = findSupport(dir, pts);
  let [p, i] = [sp, spi];
  const visible = [p];
  const visibleIndexes = [i];

  const start = i;
  const m = pts.length;

  while ((i + 1) % m !== start && absCross(dir, sub(pts[(i + 1) % m], p)) > 0) {
    i = (i + 1) % m;
    p = pts[i];
    visible.push(p);
    visibleIndexes.push(i);
  }

  i = start;
  while ((i - 1 + m) % m !== start && absCross(dir, sub(pts[(i - 1 + m) % m], p)) < 0) {
    i = (i - 1 + m) % m;
    p = pts[i];
    visible.unshift(p);
    visibleIndexes.unshift(i);
  }

  return [visible, visibleIndexes, sp, spi];
}

export function regularPoints(orig, r, n) {
  const {x, y} = orig;
  const points = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * 2 * Math.PI;
    points.push({x: x + r * Math.cos(a), y: y + r * Math.sin(a)});
  }
  return points;
}

export function randomUnitVector() {
  return (a => ({x: Math.cos(a), y: Math.sin(a)}))(Math.random() * 2 * Math.PI);
}

export function rectanglesIntersect(
  {x: x1, y: y1, width: w1, height: h1},
  {x: x2, y: y2, width: w2, height: h2}
) {
  if (x1 >= x2 + w2 || x2 >= x1 + w1) {
    return false; 
  } else if (y1 >= y2 + h2 || y2 >= y1 + h1) {
    return false; 
  } else {
    return true; 
  }
}

export function segmentsIntersect(seg0, seg1) {
  const [{x: Ax, y: Ay}, {x: Bx, y: By}, {x: Cx, y: Cy}, {x: Dx, y: Dy}] = [...seg0, ...seg1];
	const [a, b, c, d, e, f] = [Bx - Ax, Cx - Dx, By - Ay, Cy - Dy, Cx - Ax, Cy - Ay];
  const [s, t, D] = [a * f - c * e, d * e - b * f, a * d - b * c];
  
  if (D !== 0) {
    return [0 <= t && t <= D && 0 <= s && s <= D, t, s, D];
  } else {
    // Segments are colinear, since segments have zero thickness, they can never intersect
    return [false, null, null, D];
  }
}

export function intervalsIntersect(x0, x1, x2, x3) {
  if (x1 < x2) {
    return false;
  } else if (x0 > x3) {
    return false;
  }  else {
    return true;
  }
}