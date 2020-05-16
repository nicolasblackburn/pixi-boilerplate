import { add, addmult, sub, mult } from "../../geom";

export class AngleConstraint {
  protected stiffness;
  protected start;
  protected end;
  protected delta;
  
  /**
   * @param {PIXI.Point} start 
   * @param {PIXI.Point} end 
   * @param {number} stiffness 
   */
  constructor(start, end, stiffness) {
    this.stiffness = stiffness;
    this.start = start;
    this.end = end;
    this.delta = sub(this.end.position, this.start.position);
  }

  update() {
    this.end.position = add(
      this.end.position,
      mult(
        this.stiffness,
        addmult(
          -1,
          this.end.position,
          this.start.position,
          this.delta
        )
      )
    );
  }
}