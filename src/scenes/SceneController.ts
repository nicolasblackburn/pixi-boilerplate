import { notify } from "pixi-boilerplate/utils";
import { Scene } from "pixi-boilerplate/scenes/Scene";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { hasExit, hasEnter } from "pixi-boilerplate/states/StateController";
import { Rectangle } from "pixi-boilerplate/geom";

export function hasLoad(o: any): o is {load(...args: any[]): any} {
  return o.load !== undefined;
}

export class SceneController {
  protected activeScenes: Scene[];
  protected services: ApplicationServices;
  protected scenes: {[k: string]: Scene};
  protected loadedScenes: {[k: string]: boolean};
  protected currentSceneName: string;

  constructor({scenes, services}: {scenes: {[k: string]: Scene}, services: ApplicationServices}) {
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
  public get current() {
    return this.scenes[this.currentSceneName];
  }

  /**
   * @public
   * @param {string} sceneName 
   */
  public get(sceneName: string) {
    return this.scenes[sceneName];
  }

  /**
   * @param {string} newSceneName 
   * @param {[key: string]: any} params 
   */
  public play(newSceneName: string, params?: any) {
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
            if (hasLoad(newScene)) {
              return newScene.load(params);
            } else {
              return Promise.resolve();
            }
          })
          .then(() => newScene.resize(this.services.layout.viewport))
          .then(() => this.loadedScenes[newSceneName] = true) as Promise<void>;
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      this.addActiveScene(newScene);
      if (this.current && hasExit(this.current)) {
        return this.current.exit(newScene, params);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      this.currentSceneName = newSceneName;
      if (this.current && hasEnter(this.current)) {
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

  protected initScenes() {
    for (const [key, value] of Object.entries(this.scenes)) {
      if (typeof (value as any) === "function") {
        this.scenes[key] = (value as any)({services: this.services});
        this.scenes[key].name = key;
      }
    } 
  }

  /**
   * @param {number} deltaTime
   */
  public update(deltaTime: number) {
    this.notify('update', deltaTime);
  }

  /**
   * @param {Rectangle} viewport 
   */
  public resize(viewport: Rectangle) {
    this.notify('resize', viewport);
  }

  public addActiveScene(scene: Scene) {
    this.activeScenes.push(scene);
  }

  public removeActiveScene(sceneA: Scene) {
    this.activeScenes = this.activeScenes.filter(sceneB => sceneA !== sceneB);
  }

  /**
   * @param {*} fnName 
   * @param  {...any} params 
   */
  protected notify(fnName: string, ...params: any[]) {
    notify(this.activeScenes, fnName, ...params);
  }
}