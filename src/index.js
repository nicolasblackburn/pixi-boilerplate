import * as PIXI from "pixi.js";  

const assets = [
  "max_brazilian_8x8.png",  
  "polyducks_12x12.png",
  "petscii_16x16.png",
  "polyducks_gloop_8x8.png"
];

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: window.pixelDeviceResolution
});

const stage = app;

document.body.appendChild(app.view);

function onLoad() {
  
}

const loader = PIXI.Loader.shared;
assets.forEach(asset => loader.add(asset));
loader.load(onLoad);
