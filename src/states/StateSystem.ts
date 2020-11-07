import { System } from "pixi-boilerplate/system/System";
import { StateController } from "pixi-boilerplate/states/StateController";


interface StateEntity {
  states: StateController;
}

export class StateSystem extends System<StateEntity> {
  public update(deltaTime: number) {
    for (const {states} of this.entities) {
      states.update(deltaTime);
    }
  }
}