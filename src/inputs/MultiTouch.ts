import {EventEmitter} from "pixi-boilerplate/events/EventEmitter";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { abs, createPoint } from "pixi-boilerplate/geom";

const TAP_THRESHOLD_MS = 100;
const DISTANCE_THRESHOLD_PX = 10;

function findClosest(touch, touches) {
  const [closest] = touches.reduce(([min, minDist], {x, y, id, started, pressed}) => {
    const dx = touch.x - x;
    const dy = touch.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      return [{x: touch.x, y: touch.y, id, started, pressed}, dist];
    } else {
      return [min, minDist];
    }
  }, [{x: 0, y: 0, id: -1, started: false, pressed: false}, Number.POSITIVE_INFINITY]);
  if (closest.id >= 0) {
    return closest;
  }
}

class TouchInfo {
  public id: number;
  public x: number;
  public y: number;
  public startX: number;
  public startY: number;
  public pressed: boolean;
  public started: boolean;
  public startTime: number;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.pressed = false;
    this.started = false;
    this.startTime = performance.now();
  }
}

export class MultiTouch {
  protected emitter: EventEmitter;
  protected services: ApplicationServices;
  protected distanceThreshold: number;
  protected timeThreshold: number;
  protected touches: TouchInfo[];

  constructor(services) {
    this.emitter = new EventEmitter();
    this.services = services;
    this.distanceThreshold = DISTANCE_THRESHOLD_PX;
    this.timeThreshold = TAP_THRESHOLD_MS;

    this.touches = [];
    const handlers = {
      update: () => {

      },
      pointerdown: event => {
        this.touches.sort((a, b) => b.id - a.id);
        let id = 0;
        let i = 0;
        
        while (i < this.touches.length && id >= this.touches[i].id) {
          id = this.touches[i].id + 1;
          i++;
        }
        
        const touch = new TouchInfo(id, event.data.global.x, event.data.global.y);
        this.touches.push(touch);

        // Here we start a timeout, if after a short delay, the touch haven't moved, then send a tapPressed
        const update = () => {
          if (performance.now() - touch.startTime >= this.timeThreshold) {
            this.services.ticker.remove(update);
            if (!touch.started && !touch.pressed) {
              touch.pressed = true;
              this.emitter.emit('tapPressed', {
                type: 'tapPressed',
                touches: this.touches,
                touch
              });
            }
          }
        };
        this.services.ticker.add(update);
      },
      pointermove: event => {
        const touch = findClosest(event.data.global, this.touches);
        if (touch) {
          for (let i = 0; i < this.touches.length; i++) {
            if (this.touches[i].id === touch.id) {
              this.touches[i].x = touch.x;
              this.touches[i].y = touch.y;
              
              if (
                !this.touches[i].started && 
                abs(createPoint(this.touches[i].x - this.touches[i].startX, this.touches[i].y - this.touches[i].startY)) >= this.distanceThreshold
              ) {
                this.touches[i].started = true;
                this.emitter.emit('touchstart', {
                  type: 'touchstart',
                  touches: this.touches,
                  touch
                });
              }

              break;
            } 
          }
          
          if (touch.started) {
            this.emitter.emit('touchmove', {
              type: 'touchmove',
              touches: this.touches,
              touch
            });
          }
        }
      },
      pointerup: event => {
        const touch = findClosest(event.data.global, this.touches);
        if (touch) {
          let changed = [];
          for (let i = 0; i < this.touches.length; i++) {
            if (this.touches[i].id !== touch.id) {
              changed.push(this.touches[i]);
            } 
          }
          this.touches = changed;

          if (touch.started) {
            this.emitter.emit('touchend', {
              type: 'touchend',
              touches: this.touches,
              touch
            });
          } else {
            if (!touch.pressed) {
              this.emitter.emit('tapPressed', {
                type: 'tapPressed',
                touches: this.touches,
                touch
              });
            }
            this.emitter.emit('tapReleased', {
              type: 'tapReleased',
              touches: this.touches,
              touch
            });
          }
        }
      },
      pointerupoutside: event => {
        const touch = findClosest(event.data.global, this.touches);
        if (touch) {
          let changed = [];
          for (let i = 0; i < this.touches.length; i++) {
            if (this.touches[i].id !== touch.id) {
              changed.push(this.touches[i]);
            } 
          }
          this.touches = changed;

          if (touch.started) {
            this.emitter.emit('touchendoutside', {
              type: 'touchendoutside',
              touches: this.touches,
              touch
            });
          }
        }
      }
    };

    for (const [event, handler] of Object.entries(handlers)) {
      this.services.interaction.on(event, handler);
    }
  }

  public on(event, fn, priority?) {
    this.emitter.on(event, fn, priority);
  };

  public off(event, fn?) {
    this.emitter.off(event, fn);
  };
}