import { sub, abs, mult, add } from "pixi-boilerplate/geom";
import { Container, Graphics } from "pixi.js";
import { point } from "pixi-boilerplate/geom/index";

export function drawLines(w, color, pts) {
  const [{x, y}, ...rest] = pts;
  return rest
    .reduce(
      (g, {x, y}) => 
        g.lineTo(x, y), 
      new Graphics()
        .lineStyle(w, color)
        .moveTo(x, y));
}

export function fillLines(color, pts) {
  const [{x, y}, ...rest] = pts;
  return rest
    .reduce(
      (g, {x, y}) => 
        g.lineTo(x, y), 
      new Graphics()
        .beginFill(color)
        .moveTo(x, y))
    .endFill();
}

export function drawPolygon(w, color, pts) {
  const [{x, y}] = pts;
  return drawLines(w, color, pts)
    .lineTo(x, y);
}

export function fillPolygon(color, pts) {
  const [{x, y}] = pts;
  return fillLines(color, pts)
    .lineTo(x, y)
    .endFill();
}

export function drawCircle(w, color, orig, r) {
  const {x, y} = orig;
  return new Graphics()
    .lineStyle(w, color)
    .drawCircle(x, y, r);
}

export function fillCircle(color, orig, r) {
  const {x, y} = orig;
  return new Graphics()
    .beginFill(color)
    .drawCircle(x, y, r)
    .endFill();
}

export function drawRectangle(w, color, rect) {
  const {x, y, width, height} = rect;
  return new Graphics()
    .lineStyle(w, color)
    .drawRect(x, y, width, height);
}

export function fillRectangle(color, rect) {
  const {x, y, width, height} = rect;
  return new Graphics()
    .beginFill(color)
    .drawRect(x, y, width, height)
    .endFill();
}

export function fillArrowHead(color, orig, params) {
  const {x, y} = orig;
  const {x: width, y: halfHeight} = params;
  return new Graphics()
    .beginFill(color)
    .moveTo(x, y)
    .lineTo(-width, halfHeight)
    .lineTo(-3 * width / 4, 0)
    .lineTo(-width, -halfHeight)
    .closePath()
    .endFill();
}

export function drawArrow(w, color, pts) {
  const [p0, p1] = pts.slice(-2);
  const [{x: x0, y: y0}, {x: x1, y: y1}] = [p0, p1];
  const v = sub(p1, p0);
  const m = abs(v);
  pts = [...pts.slice(0, pts.length - 1), add(p0, mult((m - 2.5 * w) / m, v))];
  const arrowHead = fillArrowHead(color, point(0, 0), point(5 * w, 2.5 * w));
  const container = new Container();
  container.addChild(
    drawLines(w, color, pts),
    arrowHead
  );
  arrowHead.position.set(x1, y1);
  arrowHead.rotation = Math.atan2(y1 - y0, x1 - x0);
  return container;
}