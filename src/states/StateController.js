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
    return this;
  }
  
  /**
   * @public
   * @param {*} states 
   */
  addAll(states) {
    for (const [name, state] of Object.entries(states)) {
      this.add(name, state);
    }
    return this;
  }

  /**
   * @public
   * @param {string} name 
   * @param {[key: string]: any} params 
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

    this.enterState(state, params);

    return state;
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

  /**
   * @protected
   * @param {*} state 
   * @param {*} params 
   */
  exitState(state, params) {
    if (state.exit) {
      state.exit(params);
    }
  }

  /**
   * @protected
   * @param {*} state 
   * @param {*} params 
   */
  enterState(state, params) {
    if (state.enter) {
      state.enter(params);
    }
  }
}