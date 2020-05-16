import { createPoint } from "../geom";

export class InputsState {
  public axis;
  public button0;
  public button1;
  
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