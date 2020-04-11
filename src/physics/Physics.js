export class Physics {
  constructor(services) {
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
    this.bounds = new PIXI.Rectangle(0, 0, renderer.width, renderer.height);
  }

  /**
   * @public
   * @param {PIXI.Rectangle} bounds 
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
    for (const body of this.bodies) {
      body.velocity.x += body.acceleration.x * deltaTime / 1000;
      body.velocity.y += body.acceleration.y * deltaTime / 1000;
      body.position.x += body.velocity.x * deltaTime / 1000;
      body.position.y += body.velocity.y * deltaTime / 1000;

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
  }
}