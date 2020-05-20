import { MultiTouch } from "pixi-boilerplate/inputs/MultiTouch";
import { TouchRegion } from "pixi-boilerplate/inputs/TouchRegion";
import { sub, mult, abs, createRectangle } from "pixi-boilerplate/geom";
import { InputsState } from "./InputsState";
import { EventEmitter } from "pixi-boilerplate/events/EventEmitter";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
const { min } = Math;

export class TouchInputs {
  protected events: EventEmitter;
  protected services: ApplicationServices;
  protected state: InputsState;
  protected touchRegion: TouchRegion;

  constructor({
    services, 
    events,
    axisDistance,
    state,
    debug
  }: any) {

    this.events = events;
    this.services = services;
    this.state = state;

    if (debug) {
      const debugText = document.createElement("textarea");
      debugText.setAttribute("id", "debug");
      Object.assign(debugText.style, {
        position: "absolute",
        top: "0px",
        right: "0px",
        width: "300px",
        height: "400px"
      });
      document.body.appendChild(debugText);
    }

    const multiTouch = new MultiTouch(services);
    
    this.touchRegion = new TouchRegion({
      multiTouch,
      region: createRectangle(0, 0, 1, 1)
    });

    this.touchRegion.on('touchmove', ({from, to}) => {
      let displacement = sub(to, from);
      if (displacement.x === 0 && displacement.y === 0) {
        this.state.axis.x = 0;
        this.state.axis.y = 0;
      } else {
        const mag = abs(displacement);
        displacement = mult(1 / mag * min(axisDistance, mag) / axisDistance, displacement);
        this.state.axis.x = displacement.x;
        this.state.axis.y = displacement.y;
      }
      this.events.emit('inputChanged', {axis: this.state.axis});
    });
    
    this.touchRegion.on('touchend', () => {
      this.state.axis.x = 0;
      this.state.axis.y = 0;
      this.events.emit('inputChanged', {axis: this.state.axis});
    });

    this.touchRegion.on('touchendoutside', () => {
      this.state.axis.x = 0;
      this.state.axis.y = 0;
      this.events.emit('inputChanged', {axis: this.state.axis});
    });

    this.touchRegion.on('tapPressed', () => {
      this.state.button0.pressed = true;
      this.events.emit('inputChanged', {button0: this.state.button0});
    });

    this.touchRegion.on('tapReleased', () => {
      this.state.button0.pressed = false;
      this.events.emit('inputChanged', {button0: this.state.button0});
    });
  }
}