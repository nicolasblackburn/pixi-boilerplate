import { Body } from "pixi-boilerplate/physics/Body";
import { Sprite } from "pixi-boilerplate/renderer/Sprite";
import { Map } from "pixi-boilerplate/map/Map";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { Renderer } from "pixi.js";
import { System } from "pixi-boilerplate/system/System";

interface RendererEntity {
  body: Body;
  sprite: Sprite;
}

export class RendererSystem extends System<RendererEntity> {
  public renderer: Renderer;

  constructor(options: {services: ApplicationServices, renderer: Renderer}) {
    super(options);
    this.renderer = options.renderer; 
  }

  public update(deltaTime: number) {
    const map = <Map>this.services.components.get("map");
    for (const entity of this.entities) {
      entity.sprite.x = entity.body.position.x - (map ? map.position.x : 0);
      entity.sprite.y = entity.body.position.y - (map ? map.position.y : 0);
    }
  }
}