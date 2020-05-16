import {EventEmitter} from "../events/EventEmitter";

function findClosest(touch, touches) {
  const [closest] = touches.reduce(([min, minDist], {x, y, id}) => {
    const dx = touch.x - x;
    const dy = touch.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      return [{x: touch.x, y: touch.y, id}, dist];
    } else {
      return [min, minDist];
    }
  }, [{x: 0, y: 0, id: -1}, Number.POSITIVE_INFINITY]);
  if (closest.id >= 0) {
    return closest;
  }
}

export class MultiTouch {
  protected emitter;
  constructor(interaction) {
    this.emitter = new EventEmitter();

    let touches = [];
    const handlers = {
      pointerdown: event => {
        touches.sort((a, b) => b.id - a.id);
        let id = 0;
        let i = 0;
        while (i < touches.length && id >= touches[i].id) {
          id = touches[i].id + 1;
          i++;
        }
        const touch = {
          id,
          x: event.data.global.x,
          y: event.data.global.y
        };
        touches.push(touch);
        this.emitter.emit('touchstart', {
          type: 'touchstart',
          touches,
          touch
        });
      },
      pointermove: event => {
        const touch = findClosest(event.data.global, touches);
        if (touch) {
          for (let i = 0; i < touches.length; i++) {
            if (touches[i].id === touch.id) {
              touches[i].x = touch.x;
              touches[i].y = touch.y;
              break;
            } 
          }
          this.emitter.emit('touchmove', {
            type: 'touchmove',
            touches,
            touch
          });
        }
      },
      pointerup: event => {
        const touch = findClosest(event.data.global, touches);
        if (touch) {
          let changed = [];
          for (let i = 0; i < touches.length; i++) {
            if (touches[i].id !== touch.id) {
              changed.push(touches[i]);
            } 
          }
          touches = changed;
          this.emitter.emit('touchend', {
            type: 'touchend',
            touches,
            touch
          });
        }
      },
      pointerupoutside: event => {
        const touch = findClosest(event.data.global, touches);
        if (touch) {
          let changed = [];
          for (let i = 0; i < touches.length; i++) {
            if (touches[i].id !== touch.id) {
              changed.push(touches[i]);
            } 
          }
          touches = changed;
          this.emitter.emit('touchendoutside', {
            type: 'touchendoutside',
            touches,
            touch
          });
        }
      }
    };

    for (const [event, handler] of Object.entries(handlers)) {
      interaction.on(event, handler);
    }
  }

  public on(event, fn, priority) {
    this.emitter.on(event, fn, priority);
  };

  public off(event, fn) {
    this.emitter.off(event, fn);
  };
}