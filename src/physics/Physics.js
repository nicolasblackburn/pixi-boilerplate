import { Rectangle } from "pixi.js";


export class Physics {
  constructor(options) {
    const {services, stepDuration} = {
      stepDuration: 1000 / 120,
      ...options
    };

    const {renderer} = services;

    /**
     * @protected
     */
    this.services = services;

    /**
     * @protected
     */
    this.bodies = [];

    /**
     * @protected
     */
    this.bounds = new Rectangle(0, 0, renderer.width, renderer.height);

    /**
     * @protected
     */
    this.extraMS = 0;

    /**
     * @protected
     */
    this.stepDuration = stepDuration;
  }

  /**
   * @public
   * @param {Rectangle} bounds 
   */
  setBounds(bounds) {
    this.bounds = bounds;
  }

  /**
   * @public
   * @param {Body} body 
   * @param {number} priority 
   */
  addBody(body, priority) {
    if (!this.bodies.includes(body)) {
      this.bodies.splice(priority ? priority : 0, 0, body);
    }
  }

  /**
   * @public
   * @param {Body} body 
   */
  removeBody(body) {
    this.bodies = this.bodies.filter(bodyB => bodyB !== body);
  }

  /**
   * @public
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    this.extraMS += deltaTime;
    while (this.extraMS > 0) {
      for (const body of this.bodies) {
        body.velocity.x += body.acceleration.x * this.stepDuration / 1000;
        body.velocity.y += body.acceleration.y * this.stepDuration / 1000;
        body.position.x += body.velocity.x * this.stepDuration / 1000;
        body.position.y += body.velocity.y * this.stepDuration / 1000;
  
        body.position.x = Math.min(
          this.bounds.x + this.bounds.width - body.bounds.width * body.anchor.x,
          Math.max(
            this.bounds.x + body.bounds.width * body.anchor.x, 
            body.position.x
          )
        );
  
        body.position.y = Math.min(
          this.bounds.y + this.bounds.height - body.bounds.height * body.anchor.y,
          Math.max(
            this.bounds.y + body.bounds.height * body.anchor.y, 
            body.position.y
          )
        );
      }
      this.extraMS -= this.stepDuration;
    } 
  }
}