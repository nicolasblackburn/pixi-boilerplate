function hasUpdate(o: any): o is {update(deltaTime: number): void} {
  return !!o.update;
}

export function hasEnter(o: any): o is {enter(params: any): void} {
  return !!o.enter;
}

function hasExit(o: any): o is {exit(params: any): void} {
  return !!o.exit;
}

export class StateController<S = any> {
  public currentName: string;
  protected states: {[k: string]: S};
  
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

  public get current() {
    return this.states[this.currentName];
  }

  /**
   * @param {string} name 
   */
  public get(name: string) {
    return this.states[name];
  }

  /**
   * @param {string} name 
   * @param {State} state 
   */
  public add(name: string, state: S) {
    this.states[name] = state;
    return this;
  }
  
  /**
   * @param {{[k: string]: S}} states 
   */
  public addAll(states: {[k: string]: S}) {
    for (const [name, state] of Object.entries(states)) {
      this.add(name, state);
    }
    return this;
  }

  /**
   * @param {string} name 
   * @param {any} params 
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

    this.enterState(state, params);

    return state;
  }

  /**
   * @param {number} deltaTime 
   */
  public update(deltaTime) {
    if (this.current && hasUpdate(this.current)) {
      this.current.update(deltaTime);
    }
  }

  /**
   * @param {*} state 
   * @param {*} params 
   */
  protected exitState(state: S, params: any) {
    if (hasExit(state)) {
      state.exit(params);
    }
  }

  /**
   * @protected
   * @param {*} state 
   * @param {*} params 
   */
  protected enterState(state: S, params: any) {
    if (hasEnter(state)) {
      state.enter(params);
    }
  }
}