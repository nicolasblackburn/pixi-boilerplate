  import { Application } from "pixi-boilerplate/Application";
import { MainScene } from "pixi-boilerplate/scenes/MainScene";

const app = new Application({
  antialias: true,
  width: 16 * 64,
  height: 9 * 64,
  resolution: window.devicePixelRatio,
  assets: {
    preload: {},
    load: {},
    postLoad: {}
  },
  scenes: {
    main: app => new MainScene(app)
  },
  onLoad: () => {
    return app.services.playScene("main");
  }
});

Object.assign(window, {app});
