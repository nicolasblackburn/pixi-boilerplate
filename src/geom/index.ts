export type Point = {x: number, y: number};
export type Rectangle = {x: number, y: number, width: number, height: number};
export type Segment = [Point, Point];
export type Matrix = [number, number, number, number, number, number];

export function createPoint(x: number, y: number): Point {
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
    return createPoint(p.x, p.y);
  } else {
    q.x = p.x;
    q.y = p.y;
    return q;
  }
}

export function pointToArray(p: Point) {
  return [p.x, p.y];
}

export function createRectangle(x: number, y: number, width: number, height: number): Rectangle {
  return {x, y, width, height};
}

export function rectangleCopy(rect0: Rectangle, rect1?: Rectangle) {
  if (rect1 === undefined) {
    return createRectangle(rect0.x, rect0.y, rect0.width, rect0.height);
  } else {
    rect1.x = rect0.x;
    rect1.y = rect0.y;
    rect1.width = rect0.width;
    rect1.height = rect0.height;
    return rect1;
  }
}

export function rectangleToPoints(rect: Rectangle) {
  return [createPoint(rect.x, rect.y), createPoint(rect.x + rect.width, rect.y), createPoint(rect.x + rect.width, rect.y + rect.height), createPoint(rect.x, rect.y + rect.height)];
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
    for (const q of points) {
      p.x += q.x;
      p.y += q.y;
    }
    return p;
  }
}

export function sub(p: Point, ...points: Point[]) {
  if (points.length === 0) {
    return createPoint(0, 0);
  } else {
    const q = createPoint(p.x, p.y);
    for (const r of points) {
      q.x -= r.x;
      q.y -= r.y;
    }
    return q;
  }
}

export function pwmult(p0: Point, p1: Point) {
  return createPoint(p0.x * p1.x, p0.y * p1.y);
}

export function mult(a: number, p: Point) {
  return createPoint(a * p.x, a * p.y);
}

export function addmult(a: number, u: Point, ...vs: Point[]) {
  return add(mult(a, u), ...vs);
}

export function abs(p: Point) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
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
  const a = Math.cos(angle);
  const b = Math.sin(angle);
  return [
    a, -b, 0,
    b, a, 0
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
  const det = transformDet(matrix);
  return [
    matrix[4] / det, -matrix[1] / det, (matrix[1] * matrix[5] - matrix[2] * matrix[4]) / det,
    -matrix[3] / det, matrix[0] / det, (matrix[2] * matrix[3] - matrix[0] * matrix[5]) / det
  ];
}

export function dot(p0: Point, p1: Point) {
  return p0.x * p1.x + p0.y * p1.y;
}

export function proj(u: Point, v: Point) {
  const n = abs(v);
  if (n === 0) {
    return createPoint(0, 0);
  } else {
    return mult(dot(u, v) / n / n, v);
  }
}

export function box(rect: Rectangle, point: Point) {
  return createPoint(
    Math.max(rect.x, Math.min(rect.x + rect.width, point.x)),
    Math.max(rect.y, Math.min(rect.y + rect.height, point.y))
  );
}

export function getBounds(rects: Rectangle[]) {
  const bounds = createRectangle(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0, 0);
  for (const rect of rects) {
    bounds.x = Math.min(bounds.x, rect.x);
    bounds.y = Math.min(bounds.y, rect.y);
    bounds.width = Math.max(bounds.width, rect.x + rect.width - bounds.x);
    bounds.height = Math.max(bounds.height, rect.y + rect.height - bounds.y);
  }
  return bounds;
}

export function pointsBounds(points: Point[], bounds?: Rectangle) {
  if (bounds === undefined) {
    bounds = createRectangle(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0, 0);
  }
  
  for (const point of points) {
    bounds.x = Math.min(bounds.x, point.x);
    bounds.y = Math.min(bounds.y, point.y);
    bounds.width = Math.max(bounds.width, point.x - bounds.x);
    bounds.height = Math.max(bounds.height, point.y - bounds.y);
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

export function neg(point: Point) {
  return createPoint(-point.x, -point.y);
}

export function floatEqual(x: number, y: number, epsilon: number = 0.0000001) {
  return Math.abs(x - y) < epsilon;
}

export function norm(p: Point) {
  const n = abs(p);
  if (floatEqual(0, n)) {
    return createPoint(0, 0);
  } else {
    return createPoint(p.x / n, p.y / n);
  }
}

export function ortho(p: Point) {
  return createPoint(p.y, -p.x);
}

export function orthonorm(p: Point) {
  return norm(ortho(p));
}

export function findSupport(dir: Point, pts: Point[]) {
  let i = 0;
  let maxDist = pts[i].x * dir.x + pts[i].y * dir.y; 
  let maxDistIndex = i;
  while (i < pts.length - 1) {
    i++;
    const dist = pts[i].x * dir.x + pts[i].y * dir.y; 
    if (dist > maxDist) {
      maxDist = dist;
      maxDistIndex = i;
    }
  }
  return [pts[maxDistIndex], maxDistIndex, maxDist] as [Point, number, number];
}

function absCross(p0: Point, p1: Point) {
  return p0.x * p1.y - p1.x * p0.y;
}

export function cullInvisiblePoints(dir: Point, pts: Point[]) {
  const [support, supportIndex] = findSupport(dir, pts);
  const visible = [support];
  const visibleIndexes = [supportIndex];

  let p = support;
  let i = supportIndex;
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

  return [visible, visibleIndexes, support, supportIndex] as [Point[], number[], Point, number];
}

/**
 * Creates a regular polygon
 * @param origin
 * @param radius 
 * @param edgesCount 
 */
export function regularPoints(origin: Point, radius: number, edgesCount: number) {
  const points = [];
  for (let i = 0; i < edgesCount; i++) {
    const a = i / edgesCount * 2 * Math.PI;
    points.push(createPoint(origin.x + radius * Math.cos(a), origin.y + radius * Math.sin(a)));
  }
  return points;
}

export function randomUnitVector() {
  return (a => createPoint(Math.cos(a), Math.sin(a)))(Math.random() * 2 * Math.PI);
}

export function inRectangle(point: Point, rectangle: Rectangle) {
  return rectangle.x <= point.x && point.x <= rectangle.x + rectangle.width && 
    rectangle.y <= point.y && point.y <= rectangle.y + rectangle.height;
}

export function rectanglesIntersect(
  rect0: Rectangle,
  rect1: Rectangle
) {
  if (rect0.x >= rect1.x + rect1.width || rect1.x >= rect0.x + rect0.width) {
    return false; 
  } else if (rect0.y >= rect1.y + rect1.height || rect1.y >= rect0.y + rect0.height) {
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