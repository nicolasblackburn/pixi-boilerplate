export class Scene {
  constructor(services) {
    this.services = services;
    this.container = new PIXI.Container();
  }

  update(deltaTime) {
    for (const child of this.children) {
      if (child.update) {
        child.update(deltaTime);
      }
    }
  }
}
