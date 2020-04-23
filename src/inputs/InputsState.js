import { Point } from "pixi.js";

export class InputsState {
  constructor() {
    /**
     * @public
     */
    this.axis = new Point(0, 0);

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