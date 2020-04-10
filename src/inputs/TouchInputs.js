import { MultiTouch } from "./MultiTouch";
import { TouchRegion } from "./TouchRegion";
import { sub, mult, abs } from "../core/geom";
const { min } = Math;

export class TouchInput {
  constructor({
    application, 
    axisDistance,
    regions,
    state,
    debug
  }) {
    this.application = application;
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

    const multiTouch = new MultiTouch(application.renderer.plugins.interaction);
    
    this.axis = new TouchRegion({
      multiTouch,
      region: regions.axis
    });
    
    this.button0 = new TouchRegion({
      multiTouch,
      region: regions.button0
    });

    this.button1 = new TouchRegion({
      multiTouch,
      region: regions.button1
    });

    this.axis.on(({type, from, to}) => {
      if (type === 'touchmove') {
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
      } else {
        this.state.axis.x = 0;
        this.state.axis.y = 0;
      }
    });

    this.button0.on(({type}) => {
      if (type === 'touchstart') {
        this.state.button0.pressed = true;
      } else if (type === 'touchend' || type === 'touchcancel') {
        this.state.button0.pressed = false;
      }
    });

    this.button1.on(({type}) => {
      if (type === 'touchstart') {
        this.state.button1.pressed = true;
      } else if (type === 'touchend' || type === 'touchcancel') {
        this.state.button1.pressed = false;
      }
    });
  }
}