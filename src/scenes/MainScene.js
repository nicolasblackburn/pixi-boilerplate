import {Scene} from "pixi-boilerplate/scenes/Scene";

export class MainScene extends Scene {
  load() {
    const text = new PIXI.Text("Hello World", {
      fill: 0x995533
    });
    text.anchor.set(0.5, 1);
    text.position.set(100, 100);
    this.addChild(text);
  }
}
