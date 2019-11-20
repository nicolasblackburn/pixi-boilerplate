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

/**
 * @typedef {{
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
    super(options);

    options = {
      onStart: () => { return; },
      onPreload: () => { return; },
      onLoad: () => { return; },
      onPostLoad: () => { return; },
      onResize: () => { return; },
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
    this.optionsOnStart = options.onStart;
    this.optionsOnPreload = options.onPreload;
    this.optionsOnLoad = options.onLoad;
    this.optionsOnPostLoad = options.onPostLoad;
    this.optionsOnResize = options.onResize;

    document.body.appendChild(this.view);

    document.addEventListener("keydown", e => e.key.match(/^Arrow/) && e.preventDefault());

    this.inputs = new Inputs();
    this.ticker.add(this.onUpdate, this);
    window.addEventListener("resize", () => this.onResize({
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    }));

    for (const [key, value] of Object.entries(this.scenes)) {
      if (typeof value === "function") {
        this.scenes[key] = value(this);
      }
    } 
    
    Promise.resolve()
    .then(() => this.optionsOnStart())
    .then(() => load(this.loader, this.assets.preload))
    .then(() => this.onPreload())
    .then(() => load(this.loader, this.assets.load))
    .then(() => this.onLoad())
    .then(() => load(this.loader, this.assets.postLoad))
    .then(() => this.onPostLoad())
    .catch(error => this.onError(error));
  }

  /**
   * @public
   */
  getCurrentScene() {
    if (this.scenes[this.currentSceneName]) {
      return this.scenes[this.currentSceneName];
    } else {
      return {};
    }
  }

  /**
   * 
   * @public
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
          .then(() => this.scenes[newScene].load())
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

  /**
   * @private
   * @param {Rectangle} viewport
   */
  onResize(viewport) {
    if (!rectangleEqual(this.currentViewport, viewport)) {
      this.currentViewport = viewport;
      if (!this.scheduledResize) {
        this.scheduledResize = timeout(this.ticker, 200, () => {
          this.scheduledResize = null;
          this.optionsOnResize(this.currentViewport);
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
   * @private
   */
  onPreload() {
    this.listeners.forEach(listener => {
      if (hasPreloadCallback(listener)) {
        listener.preload(this.stage);
      }
    });
    return this.optionsOnPreload();
  }
  
  /**
   * @private
   */
  onLoad() {
    this.listeners.forEach(listener => {
      if (hasLoadCallback(listener)) {
        listener.load(this.stage);
      }
    });
    return this.optionsOnLoad();
  }
  
  /**
   * @private
   */
  onPostLoad() {
    this.listeners.forEach(listener => {
      if (hasPostLoadCallback(listener)) {
        listener.postLoad(this.stage);
      }
    });
    return this.optionsOnPostLoad();
  }
  
  /**
   * @private
   */
  onUpdate() {
    const deltaTime = this.ticker.elapsedMS;
    this.listeners.forEach(listener => {
      if (hasUpdateCallback(listener)) {
        listener.update(deltaTime);
      }
    });
  }

  /**
   * @private
   */
  onError(error) {
    this.listeners.forEach(listener => {
      if (hasErrorCallback(listener)) {
        listener.error();
      }
    });
    throw error;
  }
}
