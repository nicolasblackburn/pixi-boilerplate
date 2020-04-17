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
   */
  play(name) {
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
    return animation;
  }
}