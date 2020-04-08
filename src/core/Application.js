import {Application as PIXI_Application} from "pixi.js";  
import { 
  hasErrorCallback, 
  hasLoadCallback, 
  hasPostLoadCallback, 
  hasPreloadCallback, 
  hasResizeCallback,
  hasUpdateCallback, 
  load, 
  rectangleEqual, 
  timeout
} from "./utils";
import { Inputs } from "./Inputs";
import { TouchInput } from "../input/TouchInput";

/**
 * @typedef {{
 *   load?(): void,
 *   exit?(oldScene: string, params: {[key: string]: any}): void,
 *   enter?(newScene: string, params: {[key: string]: any}, oldScene: string): void
 * }} Scene
 */

/**
 * @typedef {{
 *   assets: {
 *     preload: {[key: string]: string}, 
 *     load: {[key: string]: string}, 
 *     postLoad: {[key: string]: string}, 
 *   },
 *   scenes: {[key: string]: Scene}
 * }} ApplicationOptions
 */
 
export class Application extends PIXI_Application {
  /**
   * 
   * @param {ApplicationOptions} options 
   */
  constructor(options) {
    super({
      antialias: true,
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.pixelDeviceResolution,
      ...options
    });

    options = {
      ...options,
      assets: {
        ...options.assets
      },
      scenes: {
        ...options.scenes
      }
    };

    this.assets = options.assets;
    this.scenes = options.scenes;
    this.loadedScenes = Object.keys(options.scenes).reduce((obj, key) => ({...obj, [key]: false}), {});
    this.currentSceneName = null;
    this.listeners = [];
    this.currentViewport = {
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    };
    this.scheduledResize = null;

    document.body.appendChild(this.view);
    document.addEventListener("keydown", e => e.key.match(/^Arrow/) && e.preventDefault());

    this.inputs = new Inputs();
    this.ticker.add(this.update, this);
    window.addEventListener("resize", () => this.onResize({
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    }));
  }

  init() {
    return Promise.resolve()
    .then(() => this.initServices())
    .then(() => this.initScenes())
    .then(() => this.preload())
    .then(() => this.load())
    .then(() => this.postLoad())
    .catch(error => this.error(error));
  }

  /**
   * @protected
   */
  initServices() {
    this.services = {
      inputs: new TouchInput({
        application: this,
        axisRegion: {
          x: 0,
          y: 0.5,
          width: 0.5,
          height: 0.5
        },
        button0Region: {
          x: 0.5,
          y: 0.4,
          width: 0.5,
          height: 0.3
        },
        button1Region: {
          x: 0.5,
          y: 0.7,
          width: 0.5,
          height: 0.3
        }
      })
    };
  }

  /**
   * @protected
   */
  initScenes() {
    for (const [key, value] of Object.entries(this.scenes)) {
      if (typeof value === "function") {
        this.scenes[key] = value(this);
      }
    } 
  }

  getCurrentScene() {
    if (this.scenes[this.currentSceneName]) {
      return this.scenes[this.currentSceneName];
    } else {
      return {};
    }
  }

  /**
   * @param {string} newScene 
   * @param {[key: string]: any} params 
   */
  playScene(newScene, params) {
    const previousScene = this.currentSceneName;
    if (this.scenes[previousScene]) {
      this.stage.addChildAt(
        this.scenes[newScene], 
        this.stage.getChildIndex(previousScene)
      );
    } else {
      this.stage.addChild(this.scenes[newScene]);
    }

    return Promise.resolve()
    .then(() => {
      if (!this.loadedScenes[newScene]) {
        return Promise.resolve()
          .then(() => {
            if (typeof this.scenes[newScene].load === "function") {
              return this.scenes[newScene].load();
            } else {
              return Promise.resolve();
            }
          })
          .then(() => this.loadedScenes[newScene] = true);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      if (typeof this.getCurrentScene().exit === "function") {
        return this.getCurrentScene().exit(newScene, params);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      this.currentSceneName = newScene;
      if (typeof this.getCurrentScene().enter === "function") {
        return this.getCurrentScene().enter(newScene, params, previousScene);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      if (this.scenes[previousScene]) {
        this.stage.removeChild(this.scenes[previousScene]);
        
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

  getViewport() {
    return this.currentViewport;
  }

  /**
   * @protected
   * @param {Rectangle} viewport
   */
  onResize(viewport) {
    this.renderer.resize(viewport.width, viewport.height);
    if (!rectangleEqual(this.currentViewport, viewport)) {
      this.currentViewport = viewport;
      if (!this.scheduledResize) {
        this.scheduledResize = timeout(this.ticker, 200, () => {
          this.scheduledResize = null;
          this.listeners.forEach(listener => {
            if (hasResizeCallback(listener)) {
              listener.resize(this.currentViewport);
            }
          });
        });
      }
    }
  }
  
  /**
   * @protected
   */
  preload() {
    return load(this.loader, this.assets.preload);
  }
  
  /**
   * @protected
   */
  load() {
    return load(this.loader, this.assets.load);
  }
  
  /**
   * @protected
   */
  postLoad() {
    return load(this.loader, this.assets.postLoad);
  }
  
  /**
   * @protected
   */
  update() {
    const deltaTime = this.ticker.elapsedMS;
    this.listeners.forEach(listener => {
      if (hasUpdateCallback(listener)) {
        listener.update(deltaTime);
      }
    });
  }

  /**
   * @protected
   */
  error(error) {
    this.listeners.forEach(listener => {
      if (hasErrorCallback(listener)) {
        listener.error();
      }
    });
    throw error;
  }
}
