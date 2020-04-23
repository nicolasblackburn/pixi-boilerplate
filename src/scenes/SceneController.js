import { notify } from "../utils";

export class SceneController {
  constructor({scenes, services}) {
    /**
     * protected
     */
    this.activeScenes = [];

    /**
     * protected
     */
    this.services = services;

    /**
     * protected
     */
    this.scenes = scenes;

    /**
     * protected
     */
    this.loadedScenes = Object.keys(scenes).reduce((obj, key) => ({...obj, [key]: false}), {});

    /**
     * protected
     */
    this.currentSceneName = null;
    
    this.initScenes();
  }

  /**
   * @public
   */
  get current() {
    return this.scenes[this.currentSceneName];
  }

  /**
   * @public
   * @param {string} sceneName 
   */
  get(sceneName) {
    return this.scenes[sceneName];
  }

  /**
   * @param {string} newSceneName 
   * @param {[key: string]: any} params 
   */
  play(newSceneName, params) {
    const newScene = this.scenes[newSceneName];
    if (!newScene) {
      return Promise.reject(new Error(`Scene '${newSceneName}' is undefined.`));
    }
    const previousScene = this.scenes[this.currentSceneName];
    if (previousScene) {
      this.services.stage.addChildAt(
        newScene.container, 
        this.services.stage.getChildIndex(previousScene.container)
      );
    } else {
      this.services.stage.addChild(newScene.container);
    }

    return Promise.resolve()
    .then(() => {
      if (!this.loadedScenes[newSceneName]) {
        return Promise.resolve()
          .then(() => {
            if (typeof newScene.load === "function") {
              return newScene.load();
            } else {
              return Promise.resolve();
            }
          })
          .then(() => this.loadedScenes[newSceneName] = true);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      this.addActiveScene(newScene);
      if (this.current && typeof this.current.exit === "function") {
        return this.current.exit(newScene, params);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      this.currentSceneName = newSceneName;
      if (this.current && typeof this.current.enter === "function") {
        return this.current.enter(newScene, params, previousScene);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      if (previousScene) {
        this.services.stage.removeChild(previousScene.container);
        this.removeActiveScene(previousScene);
      }
    })
  }

  /**
   * @protected
   */
  initScenes() {
    for (const [key, value] of Object.entries(this.scenes)) {
      if (typeof value === "function") {
        this.scenes[key] = value(this.services);
        this.scenes[key].name = key;
      }
    } 
  }

  /**
   * @public
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.notify('update', deltaTime);
  }

  /**
   * @public
   * @param {Rectangle} viewport 
   */
  resize(viewport) {
    this.notify('resize', viewport);
  }

  /**
   * @public
   */
  addActiveScene(scene) {
    this.activeScenes.push(scene);
  }

  /**
   * @public
   */
  removeActiveScene(sceneA) {
    this.activeScenes = this.activeScenes.filter(sceneB => sceneA !== sceneB);
  }

  /**
   * @protected
   * @param {*} fnName 
   * @param  {...any} params 
   */
  notify(fnName, ...params) {
    notify(this.activeScenes, fnName, ...params);
  }
}