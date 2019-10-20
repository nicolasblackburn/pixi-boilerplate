export class Scene extends PIXI.Container {
  constructor({inputs}) {
    super();
    this.inputs = inputs;
  }

  load() {
  }

  update(deltaTime) {
    for (const child of this.children) {
      if (typeof child.update === "function") {
        child.update(deltaTime);
      }
    }
  }
}