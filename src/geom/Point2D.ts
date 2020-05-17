import { Pool } from "../data_structure/Pool";

export class Point2D {
  public x: number;
  public y: number;

  constructor();
  constructor(x: number, y: number); 
  constructor(x?: number, y?: number) {
    if (x !== undefined) {
      this.assign(x, y);
    } else {
      this.assign(0, 0);
    }
  }

  public abs() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public add(point: {x: number, y: number}) {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  public assign(point: {x: number, y: number}): this;
  public assign(x: number, y: number): this; 
  public assign(arg0: any, y?: number) {
    if (y !== undefined) {
      this.x = arg0;
      this.y = y;
    } else {
      this.x = arg0.x;
      this.y = arg0.y;
    }
    return this;
  }

  public assignTo(point: {x: number, y: number}) {
    point.x = this.x;
    point.y = this.y;
    return this;
  }

  public clampRadius(radius: number) {
    const norm = this.abs();
    if (norm <= radius) {
      return this;
    } else {
      return this.multiply(radius / norm);
    }
  }

  public clampRectangle(rectangle: {x: number, y: number, width: number, height: number}) {
    this.x = Math.min(rectangle.x + rectangle.width, Math.max(rectangle.x, this.x));
    this.y = Math.min(rectangle.y + rectangle.height, Math.max(rectangle.y, this.y));
    return this;
  }

  public pairWiseMultiply(point: {x: number, y: number}) {
    this.x *= point.x;
    this.y *= point.y;
    return this;
  }

  public multiply(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  public normalize() {
    const norm = this.abs();
    if (norm >= Number.EPSILON) {
      this.multiply(1 / this.abs());
    }
    return this;
  }

  public orthogonalize() {
    const x = this.x;
    this.x = this.y;
    this.y = -x;
    return this;
  }

  public orthonormalize() {
    return this.orthogonalize().normalize();
  }

  public subtract(point: {x: number, y: number}) {
    this.x -= point.x;
    this.y -= point.y;
    return this;
  }
}

export const POINT2D_POOL = new Pool(() => new Point2D(0, 0));