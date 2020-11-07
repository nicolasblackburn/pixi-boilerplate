import { Rectangle } from "../geom";
import { Body } from "./Body";
import { POINT2D_POOL } from "pixi-boilerplate/geom/Point2D";

export function getBodyBounds(body: Body, bounds: Rectangle) {
  POINT2D_POOL.free(POINT2D_POOL.get()
    .assign(body.position)
    .add(body.bounds)
    .assignTo(bounds));
  
  bounds.width = body.bounds.width;
  bounds.height = body.bounds.height;

  return bounds;
}