import { Component } from "pixi-boilerplate/component/Component";

export class System<T> extends Component {
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