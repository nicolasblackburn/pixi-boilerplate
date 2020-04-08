import { Observable } from "../../../../src/Observable";

function inViewportRegion(point, region) {
  return region.x * window.innerWidth <= point.x &&
    point.x <= (region.x + region.width) * window.innerWidth &&
    region.y * window.innerHeight <= point.y &&
    point.y <= (region.y + region.height) * window.innerHeight;
}

function debug(event, start, region) {
  const debug = document.getElementById('debug');
  if (debug) {
    debug.value = 
  `${event.type}: {
    region: {
      x: ${region.x * window.innerWidth},
      y: ${region.y * window.innerHeight},
      width: ${region.width * window.innerWidth},
      height: ${region.height * window.innerHeight}
    },
    inRegion: ${inViewportRegion(event.touch, region) ? 'true' : 'false'},
    start: ${start ? `{
      id: ${start.id},
      x: ${start.x},
      y: ${start.y}
    }`: 'undefined'},
    touches: [${event.touches.map(({id}) => id)}],
    touch: {
      id: ${event.touch.id},
      x: ${event.touch.x},
      y: ${event.touch.y}
    }
  }
  `;
  }
}

export class TouchRegion {
  constructor({multiTouch, region}) {
    this.region = region;

    const obs = new Observable(notify => {
      let start;
      const handlers = {
        touchstart: (event) => {
          if (event.type === 'touchstart' && inViewportRegion(event.touch, this.region) && !start) {
            start = {
              ...event.touch
            };
            multiTouch.on(handlers.touchmove);
            multiTouch.on(handlers.touchend);
            multiTouch.on(handlers.touchendoutside);
            notify({
              type: event.type,
              from: event.touch
            });
          }
        },
        touchmove: (event) => {
          if (event.type === 'touchmove' && start && event.touch.id === start.id) {
            notify({
              type: event.type,
              from: start,
              to: event.touch
            });
          }
        },
        touchend: (event) => {
          if (event.type === 'touchend' && start && event.touch.id === start.id) {
            start = undefined;
            multiTouch.off(handlers.touchmove);
            multiTouch.off(handlers.touchend);
            multiTouch.off(handlers.touchendoutside);
            notify({
              type: event.type,
              from: start,
              to: event.touch
            });
          }
        },
        touchendoutside: (event) => {
          if (event.type === 'touchendoutside' && start && event.touch.id === start.id) {
            start = undefined;
            multiTouch.off(handlers.touchmove);
            multiTouch.off(handlers.touchend);
            multiTouch.off(handlers.touchendoutside);
            notify({
              type: event.type,
              from: start,
              to: event.touch
            });
          }
        }
      };
      multiTouch.on(handlers.touchstart);
    });

    this.on = (fn, priority) => obs.subscribe(fn, priority);
    this.off = fn => obs.unsubscribe(fn);
  }
}