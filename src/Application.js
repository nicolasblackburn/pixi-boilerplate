import { timeout, boundsEqual, load } from "./utils";

export class Application extends PIXI.Application {
  constructor(options) {
    super(options);

    this.assets = options.assets;
    this.scenes = options.scenes;
    this.currentScene = null;
    this.listeners = [];

    document.body.appendChild(this.view);

    this.ticker.add(this.onUpdate, this);
    window.addEventListener("resize", () => this.onResize({
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    }));
    
    this.currentViewport = {
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    };
    this.scheduledResize = null;
    
    Promise.resolve()
    .then(() => load(this.loader, this.assets.preload))
    .then(() => this.onPreload())
    .then(() => load(this.loader, this.assets.load))
    .then(() => this.onLoad())
    .then(() => load(this.loader, this.assets.postLoad))
    .then(() => this.onPostLoad())
    .catch(error => this.onError(error));
  }

  playScene(newScene, params) {
    const previousScene = this.currentScene;
    Promise.resolve()
    .then(() => {
      if (this.scenes[this.currentScene] && typeof this.scenes[this.currentScene].exit === "function") {
        return this.scenes[this.currentScene].exit(newScene, params);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      this.currentScene = newScene;
      if (this.scenes[this.currentScene] && typeof this.scenes[this.currentScene].enter === "function") {
        return this.scenes[this.currentScene].enter(scene, params, previousScene);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      if (this.scenes[previousScene]) {
        const index = this.listeners.indexOf(this.scenes[previousScene]);
        if (index >= 0) {
          this.listeners.splice(index, 1);
        }
      }
      if (this.scenes[newScene]) {
        this.listeners.push(this.scenes[newScene]);
      }
    })
  }

  onResize(viewport) {
    if (!boundsEqual(this.currentViewport, viewport)) {
      this.currentViewport = viewport;
      if (!this.scheduledResize) {
        this.scheduledResize = timeout(this.ticker, 200, () => {
          this.scheduledResize = null;
          this.listeners.forEach(listener => {
            if (typeof listener.resize === "function") {
              listener.resize(this.currentViewport);
            }
          });
        });
      }
    }
  }
  
  onPreload() {
    this.listeners.forEach(listener => {
      if (typeof listener.preload === "function") {
        listener.preload(this.stage);
      }
    });
  }
  
  onLoad() {
    this.listeners.forEach(listener => {
      if (typeof listener.load === "function") {
        listener.load(this.stage);
      }
    });
  }
  
  onPostLoad() {
    this.listeners.forEach(listener => {
      if (typeof listener.postLoad === "function") {
        listener.postLoad(this.stage);
      }
    });
  }
  
  onUpdate() {
    this.listeners.forEach(listener => {
      if (typeof this.listeners.update === "function") {
        listener.update(this.stage);
      }
    });
  }

  onError(error) {
    throw error;
  }
}