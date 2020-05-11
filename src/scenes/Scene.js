import { Container } from "pixi.js";
import { rectangle } from "pixi-boilerplate/geom";
import { resizeInto } from "pixi-boilerplate/layout";
import { notify } from "pixi-boilerplate/utils";

export class Scene {
  constructor(options) {
    const {services} = options;
    
    /**
     * @protected
     */
    this.services = services;

    /**
     * @protected
     */
    this.listeners = [];

    /**
     * @public
     */
    this.container = new Container();

    /**
     * @protected
     */
    const {width: bw, height: bh} = services.renderer;
    this.bounds = rectangle(0, 0, bw, bh);
  }

  /**
   * @public
   * @param {Listener} listener 
   * @param {number} priority 
   */
  addListener(listener, priority) {
    this.listeners.splice(priority ? priority : 0, 0, listener);
  }

  /**
   * @public
   * @param {Listener} listener 
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(listenerB => listenerB !== listener);
  }

  /**
   * @public
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    this.notify('update', deltaTime);
  }

  resize(viewport) {
    resizeInto(viewport, this.bounds, this.container);
  }

  /**
   * @protected
   * @param {string} fnName 
   * @param  {...any} params 
   */
  notify(fnName, ...params) {
    notify(this.listeners, fnName, ...params);
  }
}
