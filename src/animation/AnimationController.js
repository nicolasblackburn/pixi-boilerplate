import { StateController } from "pixi-boilerplate/states/StateController";

export class AnimationController extends StateController {
  /**
   * @override
   * @public
   * @param {string} name 
   * @param {number} time 
   */
  set(name, params) {
    const previousName = this.currentName;
    const previousState = this.states[previousName];

    if (previousState) {
      this.exitState(previousState, params);
    } 

    const state = this.states[name];

    if (!state) {
      throw new Error(`State '${name}' is undefined.`);
    }

    this.currentName = name;

    if (state.enter) {
      state.enter(params);
    }

    return state;
  }

  /**
   * @public
   * @param {*} name 
   * @param {*} time 
   */
  play(name, time) {
    this.set(name, {time});
    
    this.current.play();

    if (time !== undefined) {
      this.current.time = 0;
    }

    return this.current;
  }

  /**
   * @override
   * @protected
   * @param {*} state 
   * @param {*} params 
   */
  exitState(state, params) {
    state.pause();
    super.exitState(state, params);
  }
}