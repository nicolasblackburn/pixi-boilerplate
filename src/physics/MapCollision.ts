import { Point } from "pixi-boilerplate/geom";

export class MapCollision {
  public type: string = "map";
  public normal: Point;

  constructor(normal: Point) {
    this.normal = normal;
  }
}