export class Scenes {
  constructor(options) {
    this.application = options.application;
    this.scenes = options.scenes;
    this.loadedScenes = Object.keys(options.scenes).reduce((obj, key) => ({...obj, [key]: false}), {});
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
      this.application.stage.addChildAt(
        this.scenes[newScene], 
        this.application.stage.getChildIndex(previousScene)
      );
    } else {
      this.application.stage.addChild(this.scenes[newScene]);
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
        this.application.stage.removeChild(this.scenes[previousScene]);
        this.application.removeListener(this.scenes[previousScene]);
      }
      if (this.scenes[newScene]) {
        this.application.addListener(this.scenes[newScene]);
      }
    })
  }

  /**
   * @protected
   */
  initScenes() {
    for (const [key, value] of Object.entries(this.scenes)) {
      if (typeof value === "function") {
        this.scenes[key] = value(this.application);
      }
    } 
  }
}