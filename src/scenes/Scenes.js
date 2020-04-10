export class Scenes {
  constructor({scenes, services}) {
    this.services = services;
    this.scenes = scenes;
    this.loadedScenes = Object.keys(scenes).reduce((obj, key) => ({...obj, [key]: false}), {});
    this.currentSceneName = null;
    this.initScenes();
  }

  get current() {
    return this.scenes[this.currentSceneName];
  }

  get(sceneName) {
    return this.scenes[sceneName];
  }

  /**
   * @param {string} newScene 
   * @param {[key: string]: any} params 
   */
  play(newScene, params) {
    const previousScene = this.currentSceneName;
    if (this.scenes[previousScene]) {
      this.services.stage.addChildAt(
        this.scenes[newScene], 
        this.services.stage.getChildIndex(previousScene)
      );
    } else {
      this.services.stage.addChild(this.scenes[newScene]);
    }

    return Promise.resolve()
    .then(() => {
      if (!this.loadedScenes[newScene]) {
        return Promise.resolve()
          .then(() => {
            if (this.scenes[newScene] && typeof this.scenes[newScene].load === "function") {
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
      if (this.current && typeof this.current.exit === "function") {
        return this.current.exit(newScene, params);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      this.currentSceneName = newScene;
      if (this.current && typeof this.current.enter === "function") {
        return this.current.enter(newScene, params, previousScene);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      if (this.scenes[previousScene]) {
        this.services.stage.removeChild(this.scenes[previousScene]);
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
      }
    } 
  }

  /**
   * @public
   * @param {number} dt 
   */
  update(dt) {
    if (this.current && this.current.update) {
      this.current.update(dt);
    }
  }

  /**
   * @public
   * @param {PIXI.Rectangle} viewport 
   */
  resize(viewport) {
    if (this.current && this.current.resize) {
      this.current.resize(viewport);
    }
  }
}