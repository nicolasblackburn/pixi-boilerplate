import {Animation} from "./Animation";

export class Timeline extends Animation {
  constructor(options = {}) {
    const {onUpdate, duration: _, ...restOptions} = options;
    const state = {
      events: [],
      actives: [],
      currentIndex: 0
    };
    super({
      onUpdate: t => {
        if (state.events.length) {
          let current = state.events[state.currentIndex];
          //console.log(t, current.time, state.currentIndex);
          while (current && t >= current.time) {
            console.log(t, current.event, current.time);
            state.currentIndex++;
            current = state.events[state.currentIndex];
          }
        } 
        if (onUpdate) {
            onUpdate(t);
        }
      },
      ...restOptions
    });

    this.state = state;

    Object.defineProperties(this, {
      /**
       * @public
       */
      duration: {
        get: () => {
          if (!state.events.length) {
            return 0;
          } else {
            return state.events[state.events.length - 1].time - state.events[0].time;
          }
        }
      }
    });

    this.add = (animation, time) => {
      animation.pause();
      if (time === undefined) {
        state.events = appendEvent('end', 0, animation, appendEvent('start', 0, animation, state.events));
      } else {
        state.events = insertEvent('end', time + animation.duration, animation, insertEvent('start', time, animation, state.events));
      }
      return this;
    };
  }
}

function insertEvent(event, time, animation, events) {
  if (!events.length) {
    return [{event, time, animation}];
  } else {
    const [first, ...rest] = events;
    if (time < first.time) {
      return [{event, time, animation}, ...events];
    } else {
      return [first, ...insertEvent(event, time, animation, rest)];
    }
  }
}

function appendEvent(event, time, animation, events) {
  if (!events.length) {
    return [{event, time, animation}];
  } else {
    const [first, ...rest] = events;
    return [first, ...appendEvent(event, first.time + first.animation.duration, animation, rest)];
  }
}
