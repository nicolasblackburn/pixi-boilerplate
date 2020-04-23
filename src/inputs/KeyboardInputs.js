import { abs, mult } from "../geom";
import { InputsState } from "./InputsState";

export class KeyboardInputs {
  constructor({services, events, keys, state}) {
    /**
     * @protected
     */
    this.services = services;
    
    /**
     * @protected
     */
    this.events = events;
    
    /**
     * @protected
     */
    this.keys = {
      [keys.axisUp]: {axis: {y: -1}},
      [keys.axisRight]: {axis: {x: 1}},
      [keys.axisDown]: {axis: {y: 1}},
      [keys.axisLeft]: {axis: {x: -1}},
      [keys.button0]: {button0: {pressed: true}},
      [keys.button1]: {button1: {pressed: true}}
    };
    
    /**
     * @protected
     */
    this.cache = [];
    
    /**
     * @protected
     */
    this.state = state;

    const update = () => {
      const oldState = new InputsState();

      oldState.axis.x = this.state.axis.x;
      oldState.axis.y = this.state.axis.y;
      oldState.button0.pressed = this.state.button0.pressed;
      oldState.button1.pressed = this.state.button1.pressed;

      this.state.axis.x = 0;
      this.state.axis.y = 0; 
      this.state.button0.pressed = false;
      this.state.button1.pressed = false;

      for (const code of this.cache) {
        if (this.keys[code]) {
          const [prop, value] = Object.entries(this.keys[code])[0];
          Object.assign(this.state[prop], value);
        }
      }

      if (this.state.axis.x !== 0 || this.state.axis.y !== 0) {
        const mag = abs(this.state.axis);
        this.state.axis = mult(1 / mag, this.state.axis);
      }

      if (oldState.axis.x !== this.state.axis.x || oldState.axis.y !== this.state.axis.y) {
        this.events.emit('inputChanged', {axis: this.state.axis});
      }
      
      if (oldState.button0.pressed !== this.state.button0.pressed) {
        this.events.emit('inputChanged', {button0: this.state.button0});
      }
      
      if (oldState.button1.pressed !== this.state.button1.pressed) {
        this.events.emit('inputChanged', {button1: this.state.button1});
      }
    };

    document.addEventListener('keydown', ({code}) => {
      if (!this.cache.includes(code)) {
        this.cache.push(code);
      }
      update();
    });

    document.addEventListener('keyup', ({code}) => {
      this.cache = this.cache.filter(codeB => codeB !== code);
      update();
    });
  }
}