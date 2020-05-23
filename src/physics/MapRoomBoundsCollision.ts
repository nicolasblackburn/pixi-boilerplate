import { Point } from "pixi-boilerplate/geom";

export class MapRoomBoundsCollision {
  public type: string = "maproombounds";
  public normal: Point;

  constructor(normal: Point) {
    this.normal = normal;
  }
}