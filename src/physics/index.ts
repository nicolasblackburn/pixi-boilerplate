import { createPoint, pwmult, createRectangle, sub } from "../geom";
import { Body } from "./Body";

export function getBodyBounds(body: Body) {
  const p = sub(
    body.position, 
    body.bounds, 
    pwmult(body.anchor, createPoint(body.bounds.width, body.bounds.height))
  );
  return createRectangle(
    p.x,
    p.y,
    body.bounds.width,
    body.bounds.height
  );
}