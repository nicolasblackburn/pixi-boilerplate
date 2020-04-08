import { MultiTouch } from "./MultiTouch";
import { TouchRegion } from "./TouchRegion";

export class TouchInput {
  constructor({application, axisRegion, button0Region, button1Region, debug}) {
    this.application = application;
    this.state = {
      axis: {
        x: 0,
        y: 0
      },
      button0: {
        pressed: false
      },
      button1: {
        pressed: false
      }
    };

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
      region: axisRegion
    });
    
    this.button0 = new TouchRegion({
      multiTouch,
      region: button0Region
    });

    this.button1 = new TouchRegion({
      multiTouch,
      region: button1Region
    });

    this.axis.on(({type, from, to}) => {
      if (type === 'touchmove') {
        this.state.axis.x = to.x - from.x;
        this.state.axis.y = to.y - from.y;
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