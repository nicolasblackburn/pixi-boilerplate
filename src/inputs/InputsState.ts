import { createPoint, Point } from "pixi-boilerplate/geom";

export class InputsState {
  public axis: Point;
  public button0: {pressed: boolean};
  public button1: {pressed: boolean};
  
  constructor() {
    /**
     * @public
     */
    this.axis = createPoint(0, 0);

    /**
     * @public
     */
    this.button0 = {
      pressed: false
    };

    /**
     * @public
     */
    this.button1 = {
      pressed: false
    };
  }
}