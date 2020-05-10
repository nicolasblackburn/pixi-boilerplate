import { point, rectangle } from "pixi-boilerplate/geom";

export class Body {
  constructor(options) {
    options = {
      position: point(0, 0),
      velocity: point(0, 0),
      acceleration: point(0, 0),
      bounds: rectangle(0, 0, 16, 16),
      anchor: point(0.5, 0.5),
      mass: 1,
      maxSpeed: 60,
      onMapCollide: () => null,
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
    
    /**
     * @public
     */
    this.mass = options.mass;
    
    /**
     * @public
     */
    this.maxSpeed = options.maxSpeed;

    /**
     * @public
     */
    this.onMapCollide = options.onMapCollide;
  }
}