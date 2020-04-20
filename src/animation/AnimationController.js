import { StateController } from "../states/StateController";

export class AnimationController extends StateController {
  constructor({animations}) {
    super();

    /**
     * @protected
     */
    this.states = animations;

    for (const [_, animation] of Object.entries(this.states)) {
      animation.pause();
    }
  }

  /**
   * @public
   * @param {string} name 
   * @param {number} time 
   */
  play(name, time) {
    const previousName = this.currentName;
    const previousAnimation = this.states[previousName];

    if (previousAnimation) {
      previousAnimation.pause();
    }
    
    const animation = this.states[name];
    if (!animation) {
      throw new Error(`State '${name}' is undefined.`);
    }

    this.currentName = name;
    animation.play();

    if (time !== undefined) {
      animation.time = 0;
    }

    return animation;
  }
}