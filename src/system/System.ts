import { GameObject } from "pixi-boilerplate/game_object/GameObject";

export class System<T> extends GameObject {
  protected entities: T[] = [];

  public addEntity(entity: T, priority?: number) {
    if (!this.entities.includes(entity)) {
      this.entities.splice(priority !== undefined ? priority : this.entities.length - 1, 0, entity);
    }
  }

  public removeEntity(entity: T) {
    this.entities = this.entities.filter(entityB => entityB !== entity);
  }
}