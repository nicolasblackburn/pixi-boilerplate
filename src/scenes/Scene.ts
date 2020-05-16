import { createRectangle, Rectangle } from "pixi-boilerplate/geom";
import { resizeInto } from "pixi-boilerplate/layout";
import { notify } from "pixi-boilerplate/utils";
import { Container } from "pixi-boilerplate/renderer/Container";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";

export type SceneOptions = {
  services: ApplicationServices;
}

export class Scene {
  public bounds: Rectangle;
  public container: Container;
  public name: string;
  protected services: ApplicationServices;
  protected listeners: any[];

  constructor(options: SceneOptions) {
    const {services} = options;
    const {width: bw, height: bh} = services.renderer;
    
    this.services = services;
    this.listeners = [];

    this.bounds = createRectangle(0, 0, bw, bh);
    this.container = new Container();
  }

  /**
   * @param {Listener} listener 
   * @param {number} priority 
   */
  public addListener(listener: any, priority?: number) {
    this.listeners.splice(priority ? priority : 0, 0, listener);
  }

  /**
   * @param {Listener} listener 
   */
  public removeListener(listener: any) {
    this.listeners = this.listeners.filter(listenerB => listenerB !== listener);
  }

  /**
   * @public
   * @param {number} deltaTime 
   */
  public update(deltaTime: number) {
    this.notify('update', deltaTime);
  }

  public resize(viewport: Rectangle) {
    resizeInto(viewport, this.bounds, this.container);
  }

  /**
   * @protected
   * @param {string} fnName 
   * @param  {...any} params 
   */
  protected notify(fnName: string, ...params: any[]) {
    notify(this.listeners, fnName, ...params);
  }
}
