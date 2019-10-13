import * as PIXI from "pixi.js";  
import { Application } from "./Application";

const app = new Application({
  width: 900,
  height: 600,
  resolution: window.pixelDeviceResolution,
  assets: {
    preload: {},
    load: {},
    postLoad: {}
  },
  scenes: {}
});

window.app = app;