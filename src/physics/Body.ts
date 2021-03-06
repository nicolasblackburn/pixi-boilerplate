import { createPoint, createRectangle, Point, Rectangle } from "pixi-boilerplate/geom";

export interface BodyOptions {
  acceleration: Point;
  anchor: Point;
  bounds: Rectangle;
  mass: number;
  maxVelocityMagnitude: number;
  position: Point;
  velocity: Point;
}

export class Body {
  public acceleration: Point;
  public bounds: Rectangle;
  public mass: number;
  public maxVelocityMagnitude: number;
  public position: Point;
  public velocity: Point;
  
  constructor(options: Partial<BodyOptions>) {
    options = {
      acceleration: createPoint(0, 0),
      bounds: createRectangle(0, 0, 16, 16),
      mass: 1,
      maxVelocityMagnitude: 60,
      position: createPoint(0, 0),
      velocity: createPoint(0, 0),
      ...options
    };

    this.acceleration = options.acceleration;
    this.bounds = options.bounds;
    this.mass = options.mass;
    this.maxVelocityMagnitude = options.maxVelocityMagnitude;
    this.position = options.position;
    this.velocity = options.velocity;
  }
}