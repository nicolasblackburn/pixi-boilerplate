import * as PIXI from "pixi.js";  
import { Application } from "./Application";
import { Scene } from "./scenes/Scene";
import { MainScene } from "./scenes/MainScene";

window.app = new Application({
  antialias: true,
  width: 16 * 64,
  height: 9 * 64,
  resolution: window.pixelDeviceResolution,
  assets: {
    preload: {},
    load: {},
    postLoad: {}
  },
  scenes: {
    main: app => new MainScene(app)
  },
  onLoad: () => {
    return app.playScene("main");
  }
});
