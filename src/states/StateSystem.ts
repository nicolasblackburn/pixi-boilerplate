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
  
  protected axisMove(state: InputsState) {
    for (const {states} of this.entities) {
      notify([states.current], "axisMove", state);
    }
  }
  
  protected buttonDown(state: InputsState) {
    for (const {states} of this.entities) {
      notify([states.current], "buttonDown", state);
    }
  }
  
  protected buttonUp(state: InputsState) {
    for (const {states} of this.entities) {
      notify([states.current], "buttonUp", state);
    }
  }

  public update(deltaTime: number) {
    for (const {states} of this.entities) {
      states.update(deltaTime);
    }
  }
}