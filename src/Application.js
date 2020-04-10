import { load, notify } from "pixi-boilerplate/utils";
import { TouchInput as TouchInputs } from "pixi-boilerplate/inputs/TouchInputs";
import { Layout } from "pixi-boilerplate/layout/Layout";
import { Scenes } from "pixi-boilerplate/scenes/Scenes";
import { InputsState } from "pixi-boilerplate/inputs/InputsState";
import { KeyboardInputs } from "pixi-boilerplate/inputs/KeyboardInputs";
import { Physics } from "pixi-boilerplate/physics/Physics";

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
 
export class Application {
  /**
   * 
   * @param {ApplicationOptions} options 
   */
  constructor(options) {
    options = {
      ...options,
      assets: {
        ...options.assets
      },
      scenes: {
        ...options.scenes
      }
    };

    /**
     * protected
     */
    this.options = {
      assets: options.assets,
      scenes: options.scenes
    };

    /**
     * protected
     */
    this.application = new PIXI.Application({
      antialias: true,
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.pixelDeviceResolution,
      ...options
    });

    /**
     * protected
     */
    this.listeners = [];

    /**
     * protected
     */
    this.services = {
      inputs: null,
      interaction: null,
      layout: null,
      loader: null,
      physics: null,
      renderer: null,
      scenes: null,
      stage: null,
      storage: null,
      ticker: null
    };

    document.body.appendChild(this.application.view);
  }

  /**
   * @public
   */
  init() {
    return Promise.resolve()
    .then(() => this.initServices())
    .then(() => this.preload())
    .then(() => this.load())
    .then(() => this.postLoad())
    .catch(error => this.error(error));
  }

  /**
   * @public
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * @public
   */
  removeListener(listenerA) {
    this.listeners = this.listeners.filter(listenerB => listenerA !== listenerB);
  }

  /**
   * @protected
   */
  initServices() {
    this.initInteraction();
    this.initInputs();
    this.initLayout();
    this.initLoader();
    this.initRenderer();
    this.initPhysics();
    this.initStage();
    this.initScenes();
    this.initStorage();
    this.initTicker();
  }

  /**
   * @protected
   */
  initInputs() {
    const state = new InputsState;
    const touchInputs = new TouchInputs({
      services: this.services,
      state,
      axisDistance: 50,
      regions: {
        axis: {
          x: 0,
          y: 0.5,
          width: 0.5,
          height: 0.5
        },
        button0: {
          x: 0.5,
          y: 0.4,
          width: 0.5,
          height: 0.3
        },
        button1: {
          x: 0.5,
          y: 0.7,
          width: 0.5,
          height: 0.3
        }
      }
    });
    const keyboardInputs = new KeyboardInputs({
      services: this.services,
      state,
      keys: {
        axisUp: "ArrowUp",
        axisRight: "ArrowRight",
        axisDown: "ArrowDown",
        axisLeft: "ArrowLeft",
        button0: "KeyX",
        button1: "KeyC"
      }
    });
    this.services.inputs = {
      state,
      touchInputs,
      keyboardInputs
    };
  }

  /**
   * @protected
   */
  initInteraction() {
    this.services.interaction = this.application.renderer.plugins.interaction;
  }

  /**
   * @protected
   */
  initLayout() {
    this.services.layout = new Layout(this.services);
    this.services.layout.events.on('resize', this.resize, this);
  }

  /**
   * @protected
   */
  initLoader() {
    this.services.loader = this.application.loader;
  }

  /**
   * @protected
   */
  initPhysics() {
    this.services.physics = new Physics(this.services);
  }

  /**
   * @protected
   */
  initRenderer() {
    this.services.renderer = this.application.renderer;
  }

  /**
   * @protected
   */
  initScenes() {
    const scenes = new Scenes({
      services: this.services,
      scenes: this.options.scenes
    });
    this.addListener(scenes);
    this.services.scenes = scenes;
  }

  /**
   * @protected
   */
  initStage() {
    this.services.stage = this.application.stage;
  }

  /**
   * @protected
   */
  initStorage() {
    this.services.storage = window.localStorage;
  }

  /**
   * @protected
   */
  initTicker() {
    this.services.ticker = this.application.ticker;
    this.services.ticker.add(this.update, this);
  }
  
  /**
   * @protected
   */
  preload() {
    return load(this.services.loader, this.options.assets.preload);
  }
  
  /**
   * @protected
   */
  load() {
    return load(this.services.loader, this.options.assets.load);
  }
  
  /**
   * @protected
   */
  postLoad() {
    return load(this.services.loader, this.options.assets.postLoad);
  }
  
  /**
   * @protected
   */
  update() {
    const deltaTime = this.services.ticker.elapsedMS;
    this.notify('update', deltaTime);
  }

  /**
   * @protected
   */
  error(error) {
    this.notify('error', error);
    throw error;
  }

  /**
   * @protected
   * @param {*} viewport 
   */
  resize(viewport) {
    this.services.renderer.resize(viewport.width, viewport.height);
    this.notify('resize', viewport);
  }

  /**
   * @protected
   * @param {*} fnName 
   * @param  {...any} params 
   */
  notify(fnName, ...params) {
    notify(this.listeners, fnName, ...params);
  }
}
