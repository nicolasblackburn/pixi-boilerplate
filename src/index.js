import * as PIXI from "pixi.js";  
import { Application } from "./core/Application";
import { Scene } from "./core/Scene";
import { MainScene } from "./scene/MainScene";

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
