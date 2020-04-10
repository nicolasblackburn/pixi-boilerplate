import { Application as PIXI_Application } from "pixi.js";  
import { load } from "./utils";
import { TouchInput as TouchInputs } from "../inputs/TouchInputs";
import { Layout } from "../layout/Layout";
import { Scenes } from "./Scenes";
import { InputState as InputsState } from "../inputs/InputsState";
import { KeyboardInputs } from "../inputs/KeyboardInputs";

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

    this.options = {
      assets: options.assets,
      scenes: options.scenes
    };

    this.listeners = [];

    this.services = {
      layout: null,
      inputs: null,
      scenes: null
    };

    document.body.appendChild(this.view);
  }

  init() {
    return Promise.resolve()
    .then(() => this.initServices())
    .then(() => this.preload())
    .then(() => this.load())
    .then(() => this.postLoad())
    .catch(error => this.error(error));
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listenerA) {
    this.listeners = this.listeners.filter(listenerB => listenerA !== listenerB);
  }

  /**
   * @protected
   */
  initServices() {
    this.initLayout();
    this.initScenes();
    this.initInputs();
    this.ticker.add(this.update, this);
  }

  initLayout() {
    this.services.layout = new Layout(this);
    this.services.layout.events.on('resize', this.onResize, this);
  }

  initInputs() {
    const state = new InputsState;
    const touchInputs = new TouchInputs({
      application: this,
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
      application: this.application,
      state,
      keys: {
        axisUp: "KeyD",
        axisRight: "KeyC",
        axisDown: "KeyX",
        axisLeft: "KeyS",
        button0: "KeyI",
        button1: "KeyO"
      }
    });
    this.services.inputs = {
      state,
      touchInputs,
      keyboardInputs
    };
  }

  initScenes() {
    this.services.scenes = new Scenes({
      application: this,
      scenes: this.options.scenes
    });
  }
  
  /**
   * @protected
   */
  preload() {
    return load(this.loader, this.options.assets.preload);
  }
  
  /**
   * @protected
   */
  load() {
    return load(this.loader, this.options.assets.load);
  }
  
  /**
   * @protected
   */
  postLoad() {
    return load(this.loader, this.options.assets.postLoad);
  }
  
  /**
   * @protected
   */
  update() {
    const deltaTime = this.ticker.elapsedMS;
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
  onResize(viewport) {
    this.renderer.resize(viewport.width, viewport.height);
    this.notify('resize', viewport);
  }

  /**
   * @protected
   * @param {*} fnName 
   * @param  {...any} params 
   */
  notify(fnName, ...params) {
    for (const listener of this.listeners) {
      if (typeof listener[fnName] === 'function') {
        listener[fnName](...params);
      }
    }
  }
}
