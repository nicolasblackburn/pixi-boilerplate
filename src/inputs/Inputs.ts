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

  constructor(services) {
    /**
     * @protected
     */
    this.services = services;

    /**
     * @public
     */
    this.state = new InputsState();

    /**
     * @public
     */
    this.events = new EventEmitter();

    /**
     * @protected
     */
    this.touchInputs = new TouchInputs({
      services: this.services,
      events: this.events,
      state: this.state,
      axisDistance: 25,
      regions: {
        axis: {
          x: 0,
          y: 0,
          width: 0.5,
          height: 1
        },
        button0: {
          x: 0.5,
          y: 0.5,
          width: 0.5,
          height: 0.5
        },
        button1: {
          x: 0.5,
          y: 0,
          width: 0.5,
          height: 0.5
        }
      }
    });

    /**
     * @protected
     */
    this.keyboardInputs = new KeyboardInputs({
      services: this.services,
      events: this.events,
      state: this.state,
      keys: {
        axisUp: "ArrowUp",
        axisRight: "ArrowRight",
        axisDown: "ArrowDown",
        axisLeft: "ArrowLeft",
        button0: "KeyX",
        button1: "KeyC"
      }
    });
  }
}