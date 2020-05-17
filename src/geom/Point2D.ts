import { Pool } from "./Pool";

export class Point2D {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.assign(x, y);
  }

  public add(point: {x: number, y: number}) {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  public assign(point: {x: number, y: number}): this;
  public assign(x: number, y: number): this; 
  public assign(arg0: any, y?: number) {
    if (typeof arg0 === 'number') {
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
  }

  public clampRadius(radius: number) {
    const norm = this.abs();
    if (norm <= radius) {
      return this;
    } else {
      return this.multiply(radius / norm);
    }
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

  public abs() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
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
}

export const POINT2D_POOL = new Pool(() => new Point2D(0, 0));