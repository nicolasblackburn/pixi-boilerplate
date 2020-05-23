import { Rectangle } from "pixi-boilerplate/geom";

export class Room {
  public bounds: Rectangle;

  constructor({bounds}: {bounds: Rectangle}) {
    this.bounds = bounds;
  }
}