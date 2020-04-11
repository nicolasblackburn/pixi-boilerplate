export class Scene {
  constructor(services) {
    /**
     * @protected
     */
    this.services = services;

    /**
     * @public
     */
    this.container = new PIXI.Container();
  }

  /**
   * @public
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    for (const child of this.children) {
      if (child.update) {
        child.update(deltaTime);
      }
    }
  }
}
