import { sub, abs, mult, add, createPoint, Point, Rectangle } from "pixi-boilerplate/geom";
import { Graphics } from "pixi-boilerplate/renderer/Graphics";
import { Container } from "pixi-boilerplate/renderer/Container";

export function drawLines(lineWidth: number, color: number, points: Point[]) {
  const [{x, y}, ...rest] = points;
  return rest
    .reduce(
      (g: Graphics, {x, y}) => 
        g.lineTo(x, y), 
      new Graphics()
        .lineStyle(lineWidth, color)
        .moveTo(x, y));
}

export function fillLines(color: number, points: Point[]) {
  const [{x, y}, ...rest] = points;
  return rest
    .reduce(
      (g: Graphics, {x, y}) => 
        g.lineTo(x, y), 
      new Graphics()
        .beginFill(color)
        .moveTo(x, y))
    .endFill();
}

export function drawPolygon(lineWidth: number, color: number, points: Point[]) {
  const [{x, y}] = points;
  return drawLines(lineWidth, color, points)
    .lineTo(x, y);
}

export function fillPolygon(color: number, points: Point[]) {
  const [{x, y}] = points;
  return fillLines(color, points)
    .lineTo(x, y)
    .endFill();
}

export function drawCircle(lineWidth: number, color: number, origin: Point, radius: number) {
  const {x, y} = origin;
  return new Graphics()
    .lineStyle(lineWidth, color)
    .drawCircle(x, y, radius);
}

export function fillCircle(color: number, origin: Point, radius: number) {
  const {x, y} = origin;
  return new Graphics()
    .beginFill(color)
    .drawCircle(x, y, radius)
    .endFill();
}

export function drawRectangle(lineWidth: number, color: number, rect: Rectangle) {
  const {x, y, width, height} = rect;
  return new Graphics()
    .lineStyle(lineWidth, color)
    .drawRect(x, y, width, height);
}

export function fillRectangle(color: number, rect: Rectangle) {
  const {x, y, width, height} = rect;
  return new Graphics()
    .beginFill(color)
    .drawRect(x, y, width, height)
    .endFill();
}

export function fillArrowHead(color: number, orig: Point, params: Point) {
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

export function drawArrow(lineWidth: number, color: number, points: Point[]) {
  const [p0, p1] = points.slice(-2);
  const [{x: x0, y: y0}, {x: x1, y: y1}] = [p0, p1];
  const v = sub(p1, p0);
  const m = abs(v);
  points = [...points.slice(0, points.length - 1), add(p0, mult((m - 2.5 * lineWidth) / m, v))];
  const arrowHead = fillArrowHead(color, createPoint(0, 0), createPoint(5 * lineWidth, 2.5 * lineWidth));
  const container = new Container();
  container.addChild(
    drawLines(lineWidth, color, points),
    arrowHead
  );
  arrowHead.position.set(x1, y1);
  arrowHead.rotation = Math.atan2(y1 - y0, x1 - x0);
  return container;
}