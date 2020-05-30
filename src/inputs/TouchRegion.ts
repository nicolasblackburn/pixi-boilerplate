import {EventEmitter} from "pixi-boilerplate/events/EventEmitter";
import { Rectangle } from "pixi.js";
import { MultiTouch } from "./MultiTouch";

function inViewportRegion(point, region) {
  return region.x * window.innerWidth <= point.x &&
    point.x <= (region.x + region.width) * window.innerWidth &&
    region.y * window.innerHeight <= point.y &&
    point.y <= (region.y + region.height) * window.innerHeight;
}

export class TouchRegion {
  protected emitter: EventEmitter;
  protected multiTouch: MultiTouch;
  protected region: Rectangle;

  constructor({multiTouch, region}) {
    this.emitter = new EventEmitter();
    this.multiTouch = multiTouch;
    this.region = region;

    let start;
    const handlers = {
      tappressed: (event) => {
        if (event.type === 'tappressed' && inViewportRegion(event.touch, this.region)) {
          this.multiTouch.on('tapreleased', handlers.tapreleased);
          this.emitter.emit(event.type, {
            type: event.type,
            from: event.touch
          });
        }
      },
      tapreleased: (event) => {
        if (event.type === 'tapreleased' && inViewportRegion(event.touch, this.region)) {
          this.multiTouch.off('tapreleased');
          this.emitter.emit(event.type, {
            type: event.type,
            from: event.touch
          });
        }
      },
      touchstart: (event) => {
        if (event.type === 'touchstart' && inViewportRegion(event.touch, this.region) && !start) {
          start = {
            ...event.touch
          };
          this.multiTouch.on('touchmove', handlers.touchmove);
          this.multiTouch.on('touchend', handlers.touchend);
          this.multiTouch.on('touchendoutside', handlers.touchendoutside);

          this.emitter.emit(event.type, {
            type: event.type,
            from: event.touch
          });
        }
      },
      touchmove: (event) => {
        if (event.type === 'touchmove' && start && event.touch.id === start.id) {
          this.emitter.emit(event.type, {
            type: event.type,
            from: start,
            to: event.touch
          });
        }
      },
      touchend: (event) => {
        if (event.type === 'touchend' && start && event.touch.id === start.id) {
          start = undefined;
          this.multiTouch.off('touchmove', handlers.touchmove);
          this.multiTouch.off('touchend', handlers.touchend);
          this.multiTouch.off('touchendoutside', handlers.touchendoutside);
          this.emitter.emit(event.type, {
            type: event.type,
            from: start,
            to: event.touch
          });
        }
      },
      touchendoutside: (event) => {
        if (event.type === 'touchendoutside' && start && event.touch.id === start.id) {
          start = undefined;
          this.multiTouch.off('touchmove', handlers.touchmove);
          this.multiTouch.off('touchend', handlers.touchend);
          this.multiTouch.off('touchendoutside', handlers.touchendoutside);
          this.emitter.emit(event.type, {
            type: event.type,
            from: start,
            to: event.touch
          });
        }
      }
    };
    this.multiTouch.on('touchstart', handlers.touchstart);
    this.multiTouch.on('tappressed', handlers.tappressed);
  }

  public on(event, fn, priority?) {
    this.emitter.on(event, fn, priority);
  }

  public off(event, fn) {
    this.emitter.off(event, fn);
  }
}