import { load, notify } from "pixi-boilerplate/utils";
import { Layout } from "pixi-boilerplate/layout/Layout";
import { SceneController } from "pixi-boilerplate/scenes/SceneController";
import { Physics } from "pixi-boilerplate/physics/Physics";
import { Inputs } from "pixi-boilerplate/inputs/Inputs";
import { Application as PIXI_Application } from "pixi.js";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { Rectangle, createRectangle } from "pixi-boilerplate/geom";
import { InputsState } from "pixi-boilerplate/inputs/InputsState";
import { StateSystem } from "pixi-boilerplate/states/StateSystem";
import { Scene } from "pixi-boilerplate/scenes/Scene";

const STEPS_PER_FRAME = 10;
const FPS = 60;
const MAX_SKIP_STEPS = 5;

export interface ApplicationOptions {
  assets: {
    preload: {[name: string]: string},
    load: {[name: string]: string},
    postLoad: {[name: string]: string}
  };
  fixedUpdateStepDuration: number;
  gameBounds: Rectangle;
  scenes: {[name: string]: Scene | ((options: any) => Scene)};
  [name: string]: any;
}
 
export class Application {
  public services: ApplicationServices;
  protected application: PIXI_Application;
  protected extraMS: number;
  protected framesElapsed: number;
  protected listeners: any[];
  protected options: ApplicationOptions;
  protected stepDuration: number;

  /**
   * 
   * @param {ApplicationOptions} options 
   */
  constructor(options: Partial<ApplicationOptions>) {
    options = {
      fixedUpdateStepDuration: 1000 / FPS / STEPS_PER_FRAME,
      gameBounds: createRectangle(0, 0, window.innerWidth, window.innerHeight),
      ...options,
      assets: {
        ...options.assets
      },
      scenes: {
        ...options.scenes
      }
    };

    this.options = {
      fixedUpdateStepDuration: options.fixedUpdateStepDuration,
      gameBounds: options.gameBounds,
      assets: options.assets,
      scenes: options.scenes
    };

    this.application = new PIXI_Application({
      antialias: true,
      width: window.innerWidth,
      height: window.innerHeight,
      ...options
    });

    this.listeners = [];

    this.services = {
      globals: null,
      inputs: null,
      interaction: null,
      layout: null,
      loader: null,
      physics: null,
      renderer: null,
      scenes: null,
      stage: null,
      states: null,
      storage: null,
      ticker: null
    };

    this.extraMS = 0;
    this.framesElapsed = 0;

    document.body.appendChild(this.application.view);
  }

  public init() {
    return Promise.resolve()
    .then(() => this.initServices())
    .then(() => this.preload())
    .then(() => this.load())
    .then(() => this.postLoad())
    .catch(error => this.error(error));
  }

  public addListener(listener: any) {
    this.listeners.push(listener);
  }

  public removeListener(listenerA: any) {
    this.listeners = this.listeners.filter(listenerB => listenerA !== listenerB);
  }

  protected initServices() {
    this.initGlobals();
    this.initInteraction();
    this.initInputs();
    this.initRenderer();
    this.initStage();
    this.initStates();
    this.initLayout();
    this.initLoader();
    this.initPhysics();
    this.initScenes();
    this.initStorage();
    this.initTicker();
  }

  protected initGlobals() {
    this.services.globals = {};
  }

  protected initInputs() {
    this.services.inputs = new Inputs(this.services);
    this.services.inputs.events.on('inputChanged', this.inputChanged, this);
  }

  protected initInteraction() {
    this.services.interaction = this.application.renderer.plugins.interaction;
  }

  protected initLayout() {
    this.services.layout = new Layout({gameBounds: this.options.gameBounds, services: this.services});
    this.services.layout.events.on('resize', this.resize, this);
    this.services.layout.triggerResize();
  }

  protected initLoader() {
    this.services.loader = this.application.loader;
  }

  protected initPhysics() {
    this.services.physics = new Physics({services: this.services});
    this.addListener(this.services.physics);
  }

  protected initRenderer() {
    this.services.renderer = this.application.renderer;
  }

  protected initScenes() {
    this.services.scenes = new SceneController({
      services: this.services,
      scenes: this.options.scenes
    });
    this.addListener(this.services.scenes);
  }

  protected initStage() {
    this.services.stage = this.application.stage;
  }

  protected initStates() {
    this.services.states = new StateSystem({services: this.services});
    this.addListener(this.services.states);
  }

  protected initStorage() {
    this.services.storage = window.localStorage;
  }

  protected initTicker() {
    this.services.ticker = this.application.ticker;
    this.services.ticker.add(this.update, this);
  }
  
  protected preload() {
    return load(this.services.loader, this.options.assets.preload);
  }
  
  protected load() {
    return load(this.services.loader, this.options.assets.load);
  }
  
  protected postLoad() {
    return load(this.services.loader, this.options.assets.postLoad);
  }
  
  protected fixedUpdate(deltaTime: number) {
    this.notify('fixedUpdate', deltaTime);
  }
  
  protected inputChanged(state: InputsState) {
    this.notify('inputChanged', state);
  }
  
  protected update() {
    const deltaTime = this.services.ticker.elapsedMS;
    this.extraMS += deltaTime;
    const fixedDeltaTime = this.options.fixedUpdateStepDuration / 1000;
    let steps = 0;
    
    while (this.extraMS > 0 && steps < STEPS_PER_FRAME) {
      this.notify('fixedUpdate', fixedDeltaTime);
      this.extraMS -= this.options.fixedUpdateStepDuration;
      steps++;
    } 

    if (steps >= STEPS_PER_FRAME) {
      this.extraMS = 0;
    }

    this.notify('update', deltaTime);
  }

  protected error(error: any) {
    this.notify('error', error);
    throw error;
  }

  protected resize(viewport: Rectangle) {
    this.notify('resize', viewport);
  }

  protected notify(fnName: string, ...params: any[]) {
    notify(this.listeners, fnName, ...params);
  }
}
