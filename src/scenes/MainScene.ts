import {Scene} from "pixi-boilerplate/scenes/Scene";
import { Text } from "pixi-boilerplate/renderer/Text";

export class MainScene extends Scene {
  public load() {
    const text = new Text("Hello World", {
      fill: 0x995533
    });
    text.anchor.set(0.5, 1);
    text.position.set(100, 100);
    this.container.addChild(text);
  }
}
