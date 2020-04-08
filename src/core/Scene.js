import {hasUpdateCallback} from "./utils";

export class Scene extends PIXI.Container {
  constructor(application) {
    super();
    this.application = application;
  }

  update(deltaTime) {
    for (const child of this.children) {
      if (hasUpdateCallback(child)) {
        child.update(deltaTime);
      }
    }
  }
}
