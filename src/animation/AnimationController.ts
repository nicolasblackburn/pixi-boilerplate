import { hasEnter, StateController } from "../states/StateController";
import { Animation } from "./Animation";

export class AnimationController extends StateController<Animation> {
  /**
   * @override
   * @param {string} name 
   * @param {number} time 
   */
  public set(name: string, params: any) {
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

    if (hasEnter(state)) {
      state.enter(params);
    }

    return state;
  }

  /**
   * @public
   * @param {*} name 
   * @param {*} time 
   */
  public play(name: string, time: number) {
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
  protected exitState(state: Animation, params: any) {
    state.pause();
    super.exitState(state, params);
  }
}