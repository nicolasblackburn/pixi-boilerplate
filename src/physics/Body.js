import { Point, Rectangle } from "pixi.js";

export class Body {
  constructor(options) {
    options = {
      position: new Point(0, 0),
      velocity: new Point(0, 0),
      acceleration: new Point(0, 0),
      bounds: new Rectangle(0, 0, 16, 16),
      anchor: new Point(0.5, 0.5),
      ...options
    };

    /**
     * @public
     */
    this.position = options.position;

    /**
     * @public
     */
    this.velocity = options.velocity;

    /**
     * @public
     */
    this.acceleration = options.acceleration;

    /**
     * @public
     */
    this.bounds = options.bounds;

    /**
     * @public
     */
    this.anchor = options.anchor;
  }
}