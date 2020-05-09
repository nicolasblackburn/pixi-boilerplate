import { point, rectangle } from "pixi-boilerplate/geom";

export class Body {
  constructor(options) {
    options = {
      position: point(0, 0),
      velocity: point(0, 0),
      acceleration: point(0, 0),
      bounds: rectangle(0, 0, 16, 16),
      anchor: point(0.5, 0.5),
      maxSpeed: 60,
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

    this.maxSpeed = options.maxSpeed;
  }
}