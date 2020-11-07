import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";

export interface ComponentOptions {
  services: ApplicationServices;
}

export class Component {
  protected services: ApplicationServices;

  constructor({services}: ComponentOptions) {
    this.services = services;
  }
}