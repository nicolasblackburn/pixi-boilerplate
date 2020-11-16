import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";

export interface GameObjectOptions {
  services: ApplicationServices;
}

export class GameObject {
  protected services: ApplicationServices;

  constructor({services}: GameObjectOptions) {
    this.services = services;
  }
}