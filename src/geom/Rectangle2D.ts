import { Pool } from "../data_structure/Pool";

export class Rectangle2D {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor();
  constructor(x: number, y: number, width: number, height: number); 
  constructor(x?: number, y?: number, width?: number, height?: number) {
    if (x !== undefined) {
      this.assign(x, y, width, height);
    } else {
      this.assign(0, 0, 0, 0);
    }
  }

  public assign(rectangle: {x: number, y: number, width: number, height: number}): this;
  public assign(x: number, y: number, width: number, height: number): this; 
  public assign(arg0: any, y?: number, width?: number, height?: number) {
    if (y !== undefined) {
      this.x = arg0;
      this.y = y;
      this.width = width;
      this.height = height;
    } else {
      this.x = arg0.x;
      this.y = arg0.y;
      this.width = arg0.width;
      this.height = arg0.height;
    }
    return this;
  }

  public assignTo(rectangle: {x: number, y: number, width: number, height: number}) {
    rectangle.x = this.x;
    rectangle.y = this.y;
    rectangle.width = this.width;
    rectangle.height = this.height;
    return this;
  }

  public positionAdd(point: {x: number, y: number}) {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  public positionSubtract(point: {x: number, y: number}) {
    this.x -= point.x;
    this.y -= point.y;
    return this;
  }

  public dimensionsAdd(dims: {width: number, height: number}) {
    this.width += dims.width;
    this.height += dims.height;
    return this;
  }

  public dimensionsSubtract(dims: {width: number, height: number}) {
    this.width -= dims.width;
    this.height -= dims.height;
    return this;
  }
}

export const RECTANGLE2D_POOL = new Pool(() => new Rectangle2D(0, 0, 0, 0), 2048);