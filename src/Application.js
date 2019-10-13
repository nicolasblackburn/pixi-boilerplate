import { 
  boundsEqual, 
  hasErrorCallback, 
  hasLoadCallback, 
  hasPostLoadCallback, 
  hasPreloadCallback, 
  hasResizeCallback,
  hasUpdateCallback, 
  load, 
  timeout
} from "./utils";

export class Application extends PIXI.Application {
  /**
   * 
   * @param {{
   *   assets: {
   *     preload: {[key: string]: string}, 
   *     load: {[key: string]: string}, 
   *     postLoad: {[key: string]: string}, 
   *   },
   *   scenes: {[key: string]: Scene}
   * }} options 
   */
  constructor(options) {
    super(options);

    this.assets = options.assets;
    this.scenes = options.scenes;
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

    this.ticker.add(this.onUpdate, this);
    window.addEventListener("resize", () => this.onResize({
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    }));
    
    Promise.resolve()
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
    Promise.resolve()
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
   * @param {{
   *   x: number, 
   *   y: number, 
   *   width: number, 
   *   height: number
   * }} viewport
   */
  onResize(viewport) {
    if (!boundsEqual(this.currentViewport, viewport)) {
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
   * @private
   */
  onPreload() {
    this.listeners.forEach(listener => {
      if (hasPreloadCallback(listener)) {
        listener.preload(this.stage);
      }
    });
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
  }
  
  /**
   * @private
   */
  onUpdate() {
    this.listeners.forEach(listener => {
      if (hasUpdateCallback(listener)) {
        listener.update(this.stage);
      }
    });
  }

  /**
   * @private
   */
  onError(error) {
    this.listeners.forEach(listener => {
      if (hasErrorCallback(listener)) {
        listener.error(this.stage);
      }
    });
    throw error;
  }
}