export type Point = {x: number, y: number};
export type Rectangle = {x: number, y: number, width: number, height: number};
export type Segment = [Point, Point];
export type Matrix = [number, number, number, number, number, number];

export function createPoint(x: number, y: number) {
  return {x, y};
}

export function pointsToSegments(pts: Point[]) {
  const segments = [];
  for (let i = 0; i < pts.length; i++) {
    segments.push([pts[i], pts[(i + 1) % pts.length]]);
  }
  return segments;
}

export function pointCopy(p: Point, q?: Point) {
  if (q === undefined) {
    return {x: p.x, y: p.y};
  } else {
    q.x = p.x;
    q.y = p.y;
    return q;
  }
}

export function pointToArray(p: Point) {
  const {x, y} = p;
  return [x, y];
}

export function createRectangle(x: number, y: number, width: number, height: number) {
  return {x, y, width, height};
}

export function rectangleCopy(rect: Rectangle) {
  const {x, y, width, height} = rect;
  return createRectangle(x, y, width, height);
}

export function rectangleToPoints(rect: Rectangle) {
  const {x, y, width, height} = rect;
  return [{x, y}, {x: x + width, y}, {x: x + width, y: y + height}, {x, y: y + height}];
}

/**
* 
* @param {Rectangle} rect0
* @param {Rectangle} rect1
*/
export function rectangleEqual(rect0: Rectangle, rect1: Rectangle) {
  return rect0.x === rect1.x &&
    rect0.y === rect1.y &&
    rect0.width === rect1.width &&
    rect0.height === rect1.height;
}

export function add(...points: Point[]) {
  if (points.length === 0) {
    return createPoint(0, 0);
  } else {
    const p = createPoint(0, 0);
    for (const {x, y} of points) {
      p.x += x;
      p.y += y;
    }
    return p;
  }
}

export function sub({x, y}: Point, ...points: Point[]) {
  if (points.length === 0) {
    return createPoint(0, 0);
  } else {
    const p = createPoint(x, y);
    for (const {x, y} of points) {
      p.x -= x;
      p.y -= y;
    }
    return p;
  }
}

export function pwmult({x: x0, y: y0}: Point, {x: x1, y: y1}: Point) {
  return createPoint(x0 * x1, y0 * y1);
}

export function mult(a: number, {x, y}: Point) {
  return createPoint(a * x, a * y);
}

export function addmult(a: number, u: Point, ...vs: Point[]) {
  return add(mult(a, u), ...vs);
}

export function abs({x, y}: Point) {
  return Math.sqrt(x * x + y * y);
}

export function transform(matrix: Matrix, p: Point) {
  return createPoint(
    matrix[0] * p.x + matrix[1] * p.y + matrix[2], 
    matrix[3] * p.x + matrix[4] * p.y + matrix[5], 
  );
}

export function transformIdentity() {
  return [
    1, 0, 0,
    0, 1, 0
  ];
}

export function transformRotation(angle: number) {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return [
    cos, -sin, 0,
    sin, cos, 0
  ];
}

export function transformScale(scale: number) {
  return [
    scale, 0, 0,
    0, scale, 0
  ];
}

export function transformTranslate(x: number, y: number) {
  return [
    1, 0, x,
    0, 1, y
  ];
}

export function transformCompose(matrix0: Matrix, matrix1: Matrix) {
  return [
    matrix0[0] * matrix1[0] + matrix0[1] * matrix1[3],
    matrix0[0] * matrix1[1] + matrix0[1] * matrix1[4],
    matrix0[0] * matrix1[2] + matrix0[1] * matrix1[5] /*+ matrix[2]*/,
    matrix0[3] * matrix1[0] + matrix0[4] * matrix1[3],
    matrix0[3] * matrix1[1] + matrix0[4] * matrix1[4],
    matrix0[3] * matrix1[2] + matrix0[4] * matrix1[5] /*+ matrix[5]*/
  ];
}

export function transformDet(matrix: Matrix) {
  return matrix[0] * matrix[4] - matrix[1] * matrix[3];
}

export function transformInv(matrix: Matrix) {
  const [a, b, c, d, e, f] = matrix;
  const det = transformDet(matrix);
  return [
    e / det, -b / det, (b * f - c * e) / det,
    -d / det, a / det, (c * d - a * f) / det
  ];
}

export function dot({x: x1, y: y1}: Point, {x: x2, y: y2}: Point) {
  return x1 * x2 + y1 * y2;
}

export function proj(u: Point, v: Point) {
  const n = abs(v);
  if (n === 0) {
    return createPoint(0, 0);
  } else {
    return mult(dot(u, v) / n / n, v);
  }
}

export function box({x, y, width, height}: Rectangle, {x: x1, y: y1}: Point) {
  return createPoint(
    Math.max(x, Math.min(x + width, x1)),
    Math.max(y, Math.min(y + height, y1))
  );
}

export function getBounds(rects: Rectangle[]) {
  const bounds = createRectangle(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0, 0);
  for (const {x, y, width, height} of rects) {
    bounds.x = Math.min(bounds.x, x);
    bounds.y = Math.min(bounds.y, y);
    bounds.width = Math.max(bounds.width, x + width - bounds.x);
    bounds.height = Math.max(bounds.height, y + height - bounds.y);
  }
  return bounds;
}

export function pointsBounds(points: Point[]) {
  const bounds = createRectangle(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0, 0);
  for (const {x, y} of points) {
    bounds.x = Math.min(bounds.x, x);
    bounds.y = Math.min(bounds.y, y);
    bounds.width = Math.max(bounds.width, x - bounds.x);
    bounds.height = Math.max(bounds.height, y - bounds.y);
  }
  return bounds;
}

export function clampAbs(r: number, p: Point) {
  const n = abs(p);
  if (n < r) {
    return p;
  } else {
    return mult(r, norm(p));
  }
}

export function clampRect(rect: Rectangle, p: Point) {
  return createPoint(
    Math.min(rect.x + rect.width, Math.max(rect.x, p.x)),
    Math.min(rect.y + rect.height, Math.max(rect.y, p.y)),
  );
}

export function neg({x, y}: Point) {
  return createPoint(-x, -y);
}

export function floatEqual(x: number, y: number, epsilon: number = 0.0000001) {
  return Math.abs(x - y) < epsilon;
}

export function norm(p: Point) {
  const {x, y} = p;
  const n = abs(p);
  if (floatEqual(0, n)) {
    return createPoint(0, 0);
  } else {
    return createPoint(x / n, y / n);
  }
}

export function ortho(p: Point) {
  const {x, y} = p;
  return {x: y, y: -x};
}

export function orthonorm(p: Point) {
  return norm(ortho(p));
}

export function findSupport(dir: Point, pts: Point[]) {
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
  return [pts[maxDistIndex], maxDistIndex, maxDist] as [Point, number, number];
}

function absCross({x: x0, y: y0}: Point, {x: x1, y: y1}: Point) {
  return x0 * y1 - x1 * y0;
}

export function cullInvisiblePoints(dir: Point, pts: Point[]) {
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

  return [visible, visibleIndexes, sp, spi] as [Point[], number[], Point, number];
}

/**
 * Creates a regular polygon
 * @param origin
 * @param radius 
 * @param edgesCount 
 */
export function regularPoints(origin: Point, radius: number, edgesCount: number) {
  const {x, y} = origin;
  const points = [];
  for (let i = 0; i < edgesCount; i++) {
    const a = i / edgesCount * 2 * Math.PI;
    points.push({x: x + radius * Math.cos(a), y: y + radius * Math.sin(a)});
  }
  return points;
}

export function randomUnitVector() {
  return (a => ({x: Math.cos(a), y: Math.sin(a)}))(Math.random() * 2 * Math.PI);
}

export function rectanglesIntersect(
  {x: x1, y: y1, width: w1, height: h1}: Rectangle,
  {x: x2, y: y2, width: w2, height: h2}: Rectangle
) {
  if (x1 >= x2 + w2 || x2 >= x1 + w1) {
    return false; 
  } else if (y1 >= y2 + h2 || y2 >= y1 + h1) {
    return false; 
  } else {
    return true; 
  }
}

export function segmentsIntersect(seg0: Segment, seg1: Segment): [boolean, number, number, number] {
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

export function intervalsIntersect(x0: number, x1: number, x2: number, x3: number) {
  if (x1 < x2) {
    return false;
  } else if (x0 > x3) {
    return false;
  }  else {
    return true;
  }
}