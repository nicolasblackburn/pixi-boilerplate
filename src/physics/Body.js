export class Body {
  constructor(options) {
    options = {
      position: new PIXI.Point(0, 0),
      velocity: new PIXI.Point(0, 0),
      acceleration: new PIXI.Point(0, 0),
      bounds: new PIXI.Rectangle(0, 0, 64, 64),
      anchor: new PIXI.Point(0.5, 0.5),
      ...options
    };

    /**
     * @public
     */
    this.position = options.position;

    /**
     * @public
     */
    this.velocity = options.velocity;

    /**
     * @public
     */
    this.acceleration = options.acceleration;

    /**
     * @public
     */
    this.bounds = options.bounds;

    /**
     * @public
     */
    this.anchor = options.anchor;
  }
}