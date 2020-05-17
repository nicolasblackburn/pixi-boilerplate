import { Rectangle } from "../geom";
import { Body } from "./Body";
import { POINT2D_POOL } from "pixi-boilerplate/geom/Point2D";

export function getBodyBounds(body: Body, bounds: Rectangle) {
  const dimensions = POINT2D_POOL.get().assign(body.bounds.width, body.bounds.height);
  const position = POINT2D_POOL.get()
    .assign(body.position)
    .subtract(body.bounds)
    .subtract(dimensions.pairWiseMultiply(body.anchor))
    .assignTo(bounds);
  
  bounds.width = body.bounds.width;
  bounds.height = body.bounds.height;

  POINT2D_POOL.free(dimensions);
  POINT2D_POOL.free(position);

  return bounds;
}