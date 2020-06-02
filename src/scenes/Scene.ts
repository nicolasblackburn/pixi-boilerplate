import { notify } from "pixi-boilerplate/utils";
import { Container } from "pixi-boilerplate/renderer/Container";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { Rectangle } from "pixi-boilerplate/geom";
import { InputsState } from "pixi-boilerplate/inputs/InputsState";

export type SceneOptions = {
  services: ApplicationServices;
}

export class Scene {
  public container: Container;
  public name: string;
  protected listeners: any[];
  protected services: ApplicationServices;

  constructor(options: SceneOptions) {
    const {services} = options;
    
    this.services = services;
    this.listeners = [];

    this.container = new Container();
  }

  public addListener(listener: any, priority?: number) {
    if (priority !== undefined) {
      this.listeners.splice(priority, 0, listener);
    } else {
      this.listeners.push(listener);
    }
  }

  public fixedUpdate(deltaTime: number) {
    this.notify('fixedUpdate', deltaTime);
  }

  public inputChanged(inputs: InputsState) { 
    this.notify('inputChanged', inputs);
  }

  public removeListener(listener: any) {
    this.listeners = this.listeners.filter(listenerB => listenerB !== listener);
  }

  public resize(viewport: Rectangle) { 
    this.notify('resize', viewport);
  }

  public update(deltaTime: number) {
    this.notify('update', deltaTime);
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
