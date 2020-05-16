import { MultiTouch } from "./MultiTouch";
import { TouchRegion } from "./TouchRegion";
import { sub, mult, abs } from "../geom";
const { min } = Math;

export class TouchInputs {
  protected services;
  protected events;
  protected state;
  protected axis;
  protected button0;
  protected button1;


  constructor({
    services, 
    events,
    axisDistance,
    regions,
    state,
    debug
  }: any) {
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

    const multiTouch = new MultiTouch(services.interaction);
    
    /**
     * @protected
     */
    this.axis = new TouchRegion({
      multiTouch,
      region: regions.axis
    });
    
    /**
     * @protected
     */
    this.button0 = new TouchRegion({
      multiTouch,
      region: regions.button0
    });
    
    /**
     * @protected
     */
    this.button1 = new TouchRegion({
      multiTouch,
      region: regions.button1
    });

    this.axis.on('touchmove', ({from, to}) => {
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
    
    this.axis.on('touchend', () => {
      this.state.axis.x = 0;
      this.state.axis.y = 0;
      this.events.emit('inputChanged', {axis: this.state.axis});
    });

    this.axis.on('touchendoutside', () => {
      this.state.axis.x = 0;
      this.state.axis.y = 0;
      this.events.emit('inputChanged', {axis: this.state.axis});
    });

    this.button0.on('touchstart', () => {
      this.state.button0.pressed = true;
      this.events.emit('inputChanged', {button0: this.state.button0});
    });

    this.button0.on('touchend', () => {
      this.state.button0.pressed = false;
      this.events.emit('inputChanged', {button0: this.state.button0});
    });

    this.button0.on('touchcancel', () => {
      this.state.button0.pressed = false;
      this.events.emit('inputChanged', {button0: this.state.button0});
    });

    this.button1.on('touchstart', () => {
      this.state.button1.pressed = true;
      this.events.emit('inputChanged', {button1: this.state.button1});
    });

    this.button1.on('touchend', () => {
      this.state.button1.pressed = false;
      this.events.emit('inputChanged', {button1: this.state.button1});
    });

    this.button1.on('touchcancel', () => {
      this.state.button1.pressed = false;
      this.events.emit('inputChanged', {button1: this.state.button1});
    });
  }
}