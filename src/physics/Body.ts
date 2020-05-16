import { createPoint, rectangle } from "../geom";

export class Body {
  public position;
  public velocity;
  public acceleration;
  public anchor;
  public bounds;
  public transform;
  public mass;
  public maxSpeed;
  public onMapCollide;
  
  constructor(options) {
    options = {
      position: createPoint(0, 0),
      velocity: createPoint(0, 0),
      acceleration: createPoint(0, 0),
      bounds: rectangle(0, 0, 16, 16),
      anchor: createPoint(0.5, 0.5),
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
    this.transform = {
      translate: createPoint(0, 0),
      scale: createPoint(0, 0),
      rotate: 0
    }

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