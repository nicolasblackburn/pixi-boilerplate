import { MultiTouch } from "pixi-boilerplate/inputs/MultiTouch";
import { TouchRegion } from "pixi-boilerplate/inputs/TouchRegion";
import { sub, mult, abs, createRectangle, createPoint, Rectangle } from "pixi-boilerplate/geom";
import { InputsState } from "./InputsState";
import { EventEmitter } from "pixi-boilerplate/events/EventEmitter";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { discreteAngle } from "pixi-boilerplate/utils";
const { min } = Math;

const TAP_THRESHOLD_MS = 100;
const DISTANCE_THRESHOLD_PX = 5;

export class TouchInputs {
  protected config: {
    axisDistance: number,
    dualHands: boolean,
    virtualDPad: boolean
  };
  protected events: EventEmitter;
  protected services: ApplicationServices;
  protected state: InputsState;
  protected touchRegion: TouchRegion;
  protected secondaryTouchRegion: TouchRegion;
  protected regionRectangles: Rectangle[];

  constructor({
    services, 
    events,
    state,
    axisDistance,
    dualHands,
    virtualDPad
  }: any) {

    this.config = {
      axisDistance,
      dualHands,
      virtualDPad
    };
    this.events = events;
    this.services = services;
    this.state = state;

    this.config.dualHands = false;

    const multiTouch = new MultiTouch({
      services, 
      delayTouchStart: !this.config.dualHands ? true : false,
      tapTimeThresold: !this.config.dualHands ? TAP_THRESHOLD_MS : 0, 
      touchStartDistanceThresold: !this.config.dualHands ? DISTANCE_THRESHOLD_PX : 0
    });

    this.regionRectangles = [
      createRectangle(0, 0, 1, 1),
      createRectangle(0, 0, 1 / 2, 1),
      createRectangle(1 / 2, 0, 1, 1)
    ];
    
    this.touchRegion = new TouchRegion({
      multiTouch,
      region: !this.config.dualHands ? this.regionRectangles[0] : this.regionRectangles[1]
    });
    
    this.secondaryTouchRegion = new TouchRegion({
      multiTouch,
      region: this.regionRectangles[2]
    });

    this.touchRegion.on('touchmove', ({from, to}) => {
      let displacement = sub(to, from);
      if (displacement.x === 0 && displacement.y === 0) {
        this.state.axis.x = 0;
        this.state.axis.y = 0;
      } else {
        const mag = abs(displacement);
        const normalizedValue = min(this.config.axisDistance, mag) / this.config.axisDistance; 
        if (this.config.virtualDPad) {
          const angle = 2 * Math.PI * discreteAngle(8, displacement) / 8;
          displacement = mult(normalizedValue, createPoint(Math.cos(angle), Math.sin(angle)));
        } else {
          displacement = mult(normalizedValue / mag, displacement);
        }
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

    this.touchRegion.on('tappressed', () => {
      if (!this.config.dualHands) {
        this.state.button0.pressed = true;
        this.events.emit('inputChanged', {button0: this.state.button0});
      }
    });

    this.touchRegion.on('tapreleased', () => {
      if (!this.config.dualHands) {
        this.state.button0.pressed = false;
        this.events.emit('inputChanged', {button0: this.state.button0});
      }
    });

    this.secondaryTouchRegion.on('touchstart', () => {
      if (this.config.dualHands) {
        this.state.button0.pressed = true;
        this.events.emit('inputChanged', {button0: this.state.button0});
      }
    });

    this.secondaryTouchRegion.on('touchend', () => {
      if (this.config.dualHands) {
        this.state.button0.pressed = false;
        this.events.emit('inputChanged', {button0: this.state.button0});
      }
    });
  }
}