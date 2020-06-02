import { createPoint, Point } from "pixi-boilerplate/geom";

export interface AxisState {
  axis: Point;
}

export interface Button0State {
  button0: {pressed: boolean};
}

export interface Button1State {
  button1: {pressed: boolean};
}

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