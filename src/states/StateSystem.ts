import { System } from "pixi-boilerplate/system/System";
import { StateController } from "pixi-boilerplate/states/StateController";
import { notify } from "pixi-boilerplate/utils";
import { InputsState } from "pixi-boilerplate/inputs/InputsState";


interface StateEntity {
  states: StateController;
}

export class StateSystem extends System<StateEntity> {
  public fixedUpdate(deltaTime: number) {
    for (const {states} of this.entities) {
      notify([states.current], "fixedUpdate", deltaTime);
    }
  }

  public inputChanged(state: Partial<InputsState>) {
    for (const {states} of this.entities) {
      notify([states.current], "inputChanged", state);
    }
  }

  public update(deltaTime: number) {
    for (const {states} of this.entities) {
      states.update(deltaTime);
    }
  }
}