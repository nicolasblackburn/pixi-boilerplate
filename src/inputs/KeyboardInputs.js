import { abs, mult } from "pixi-boilerplate/geom";
const { min } = Math;

export class KeyboardInputs {
  constructor({services, keys, state}) {
    this.services = services;
    this.keys = {
      [keys.axisUp]: {axis: {y: -1}},
      [keys.axisRight]: {axis: {x: 1}},
      [keys.axisDown]: {axis: {y: 1}},
      [keys.axisLeft]: {axis: {x: -1}},
      [keys.button0]: {button0: {pressed: true}},
      [keys.button1]: {button1: {pressed: true}}
    };
    this.cache = [];
    this.state = state;

    const update = () => {
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