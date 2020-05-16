import { abs, add, sub, mult } from "../../geom";

export class DistanceConstraint {
  protected stiffness;
  protected start;
  protected end;
  protected distance;
  
  /**
   * @param {PIXI.Point} start 
   * @param {PIXI.Point} end 
   * @param {number} stiffness 
   */
  constructor(start, end, stiffness) {
    this.stiffness = stiffness;
    this.start = start;
    this.end = end;
    this.distance = abs(sub(this.start.position, this.end.position));
  }

  update() {
    const difference = sub(this.end.position, this.start.position);
    const offset = mult(this.stiffness * (this.distance / abs(difference) - 1), difference);

    const totalMass = this.start.mass + this.end.mass;

    this.start.position = add(
      this.start.position,
      mult(-this.end.mass / totalMass, offset)
    );

    this.end.position = add(
      this.end.position,
      mult(this.start.mass / totalMass, offset)
    );
  }
}