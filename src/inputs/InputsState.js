import { point } from "pixi-boilerplate/geom";

export class InputsState {
  constructor() {
    /**
     * @public
     */
    this.axis = point(0, 0);

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