import { rectangleEqual, timeout } from "pixi-boilerplate/utils";

export class Layout {
  constructor(services) {
    /**
     * @public
     */
    this.events = new PIXI.utils.EventEmitter();

    /**
     * @public
     */
    this.viewport = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);

    /**
     * @protected
     */
    this.services = services;

    /**
     * @protected
     */
    this.scheduledResize = null;

    window.addEventListener("resize", () => this.resize({
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    }));
  }

  /**
   * @protected
   */
  triggerResize() {
    this.events.emit("resize", this.viewport);
  } 

  /**
   * @protected
   * @param {Rectangle} viewport
   */
  resize(viewport) {
    if (!rectangleEqual(this.viewport, viewport)) {
      this.viewport = viewport;
      if (!this.scheduledResize) {
        this.scheduledResize = timeout(this.services.ticker, 200, () => {
          this.scheduledResize = null;
          this.triggerResize();
        });
      }
    }
  }
}