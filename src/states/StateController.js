export class StateController {
  constructor() {
    /**
     * protected
     */
    this.states = {};

    /**
     * protected
     */
    this.currentName = null;
  }

  /**
   * @public
   */
  get current() {
    return this.states[this.currentName];
  }

  /**
   * @public
   * @param {string} name 
   */
  get(name) {
    return this.states[name];
  }

  /**
   * @public
   * @param {string} name 
   * @param {State} state 
   */
  add(name, state) {
    this.states[name] = state;
  }

  /**
   * @public
   * @param {string} name 
   * @param {[key: string]: any} params 
   */
  play(name, params) {
    const state = this.states[name];

    if (!state) {
      throw new Error(`State '${name}' is undefined.`);
    }

    const previousName = this.currentName;
    this.currentName = name;

    if (state.enter) {
      this.current.enter(params);
    }

    const previousState = this.states[previousName];

    if (previousState && previousState.exit) {
      previousState.exit(params);
    }
  }

  /**
   * @public
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    if (this.current && this.current.update) {
      this.current.update(deltaTime);
    }
  }
}