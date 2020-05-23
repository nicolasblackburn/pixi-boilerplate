import { createPoint, createRectangle, Point, Rectangle } from "pixi-boilerplate/geom";

export class Body {
  public acceleration: Point;
  public anchor: Point;
  public bounds: Rectangle;
  public entity: any;
  public mass: number;
  public maxSpeed: number;
  public onMapWallCollide: (...args: any[]) => void;
  public position: Point;
  public transform: {
    translate: Point,
    scale: Point,
    rotate: number
  };
  public velocity: Point;
  
  constructor(options: Partial<{acceleration: Point, anchor: Point, bounds: Rectangle, mass: number, maxSpeed: number, onMapWallCollide(...args: any[]): void, position: Point, velocity: Point}> & {entity: any}) {
    options = {
      acceleration: createPoint(0, 0),
      anchor: createPoint(0.5, 0.5),
      bounds: createRectangle(0, 0, 16, 16),
      mass: 1,
      maxSpeed: 60,
      onMapWallCollide: () => null,
      position: createPoint(0, 0),
      velocity: createPoint(0, 0),
      ...options
    };

    this.acceleration = options.acceleration;
    this.anchor = options.anchor;
    this.bounds = options.bounds;
    this.entity = options.entity;
    this.mass = options.mass;
    this.maxSpeed = options.maxSpeed;
    this.onMapWallCollide = options.onMapWallCollide;
    this.position = options.position;
    this.transform = {
      translate: createPoint(0, 0),
      scale: createPoint(0, 0),
      rotate: 0
    }
    this.velocity = options.velocity;
  }
}