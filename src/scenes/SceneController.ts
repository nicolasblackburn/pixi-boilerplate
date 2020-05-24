import { notify } from "pixi-boilerplate/utils";
import { Scene } from "pixi-boilerplate/scenes/Scene";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { hasExit, hasEnter } from "pixi-boilerplate/states/StateController";
import { Rectangle } from "pixi-boilerplate/geom";
import { InputsState } from "pixi-boilerplate/inputs/InputsState";

const SKIP_INPUT_CHANGED_MS = 101;

export function hasLoad(o: any): o is {load(...args: any[]): any} {
  return o.load !== undefined;
}

export function hasResize(o: any): o is {resize(...args: any[]): any} {
  return o.resize !== undefined;
}

export class SceneController {
  protected activeScenes: Scene[];
  protected services: ApplicationServices;
  protected scenes: {[k: string]: Scene};
  protected loadedScenes: {[k: string]: boolean};
  protected currentSceneName: string;
  protected skipInputChangesTimeout: number;

  constructor({scenes, services}: {scenes: {[k: string]: Scene}, services: ApplicationServices}) {
    this.activeScenes = [];
    this.services = services;
    this.scenes = scenes;
    this.loadedScenes = Object.keys(scenes).reduce((obj, key) => ({...obj, [key]: false}), {});
    this.currentSceneName = null;
    
    this.initScenes();
  }

  public get current() {
    return this.scenes[this.currentSceneName];
  }

  public addActiveScene(scene: Scene) {
    this.activeScenes.push(scene);
  }

  public fixedUpdate(deltaTime: number) {
    this.notify('fixedUpdate', deltaTime);
  }

  public get(sceneName: string) {
    return this.scenes[sceneName];
  }

  public inputChanged(state: InputsState) {
    if (!this.skipInputChangesTimeout) {
      this.notify('inputChanged', state);
    }
  }

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
    this.skipInputChangesTimeout = SKIP_INPUT_CHANGED_MS;

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
          .then(() => hasResize(newScene) ? newScene.resize(this.services.layout.viewport) : null)
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

  public removeActiveScene(sceneA: Scene) {
    this.activeScenes = this.activeScenes.filter(sceneB => sceneA !== sceneB);
  }

  public resize(viewport: Rectangle) {
    for (const scene of Object.values(this.scenes)) {
      if (hasResize(scene)) {
        scene.resize(viewport);
      }
    }
  }

  public update(deltaTime: number) {
    if (this.skipInputChangesTimeout > 0) {
      this.skipInputChangesTimeout = Math.max(0, this.skipInputChangesTimeout - deltaTime);
    }
    this.notify('update', deltaTime);
  }

  protected initScenes() {
    for (const [key, value] of Object.entries(this.scenes)) {
      if (typeof (value as any) === "function") {
        this.scenes[key] = (value as any)({services: this.services});
        this.scenes[key].name = key;
      }
    } 
  }

  protected notify(fnName: string, ...params: any[]) {
    notify(this.activeScenes, fnName, ...params);
  }
}