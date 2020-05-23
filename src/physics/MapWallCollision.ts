import { Point } from "pixi-boilerplate/geom";

export class MapWallCollision {
  public type: string = "mapwall";
  public normal: Point;

  constructor(normal: Point) {
    this.normal = normal;
  }
}