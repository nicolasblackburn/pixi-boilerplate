import {hasUpdateCallback} from "./utils";

export class Scene extends PIXI.Container {
  constructor(services) {
    super();
    this.services = services;
  }

  update(deltaTime) {
    for (const child of this.children) {
      if (hasUpdateCallback(child)) {
        child.update(deltaTime);
      }
    }
  }
}
