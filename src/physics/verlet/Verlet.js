import { addmult, point, pointCopy, sub } from "pixi-boilerplate/geom";

export class Verlet {
  /**
   */
  constructor(x, y, mass) {
    this.acceleration = point(0, 0);
    this.previousPosition = point(0, 0);
    this.position = point(x, y);
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