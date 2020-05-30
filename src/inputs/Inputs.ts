import { InputsState } from "pixi-boilerplate/inputs/InputsState";
import { KeyboardInputs } from "pixi-boilerplate/inputs/KeyboardInputs";
import { TouchInputs } from "pixi-boilerplate/inputs/TouchInputs";
import {EventEmitter} from "pixi-boilerplate/events/EventEmitter";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";

export class Inputs {
  public state: InputsState;
  public events: EventEmitter;

  protected keyboardInputs: KeyboardInputs;
  protected services: ApplicationServices;
  protected touchInputs: TouchInputs;

  constructor(services: ApplicationServices) {
    const state = new InputsState();
    const events = new EventEmitter();
    
    this.services = services;

    this.touchInputs = new TouchInputs({
      services: this.services,
      events: events,
      state: state,
      axisDistance: 25,
      dualHands: false,
      virtualDPad: true
    });

    this.keyboardInputs = new KeyboardInputs({
      services: this.services,
      events: events,
      state: state,
      keys: {
        axisUp: "ArrowUp",
        axisRight: "ArrowRight",
        axisDown: "ArrowDown",
        axisLeft: "ArrowLeft",
        button0: "KeyX",
        button1: "KeyC"
      }
    });

    this.state = state;
    this.events = events;
  }
}