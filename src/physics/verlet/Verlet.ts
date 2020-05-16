import { addmult, createPoint, pointCopy, sub } from "pixi-boilerplate/geom";

export class Verlet {
  public acceleration;
  public previousPosition;
  public position;
  public mass;

  /**
   */
  constructor(x, y, mass) {
    this.acceleration = createPoint(0, 0);
    this.previousPosition = createPoint(0, 0);
    this.position = createPoint(x, y);
    this.mass = mass;
  }

  update(deltaTime) {
    const previousPosition = pointCopy(this.position);
    this.position = (
      addmult(
        deltaTime * deltaTime, 
        this.acceleration,
        sub(this.position, previousPosition),
        this.position
      )
    );
    this.previousPosition = previousPosition;
  } 
}