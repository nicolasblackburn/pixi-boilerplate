import {Animation} from "pixi-boilerplate/animation/Animation";

export class Timeline extends Animation {
  protected state;

  constructor(options = {}) {
    const {onUpdate, duration: _, ...restOptions}: any = options;
    const state = {
      animations: [],
      events: [],
      actives: [],
      currentIndex: 0,
      lastTime: 0
    };
    super({
      onUpdate: t => {
        update(t, state);
        if (onUpdate) {
            onUpdate(t);
        }
        this.state.lastTime = t;
      },
      ...restOptions
    });
    this.state = state;
  }

  public get duration() {
    if (!this.state.animations.length) {
      return 0;
    } else {
      const [min, max] = this.state.animations.reduce(([min, max], {startTime, animation}) =>
        [Math.min(min, startTime), Math.max(max, startTime + animation.duration)], 
        [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
      return max - min;
    }
  }

  public add(animation, startTime) {
    animation.pause();
    if (startTime === undefined) {
      this.state.animations.push({startTime: this.duration, active: false, animation});
    } else {
      this.state.animations.push({startTime, active: false, animation});
    }
    return this;
  };
}

function update(time, state) {
  if (time < state.lastTime) {
    // Rewind animation
    for (const entry of state.animations.reverse()) {
      const {startTime, active, animation} = entry;
      if (time <= startTime && startTime <= state.lastTime && !active) {
        entry.active = false;
        animation.time = null;
      }
    }

  } else if (time > state.lastTime) {
    const actives: any[] = [];
    for (const entry of state.animations) {
      const {startTime, animation} = entry;
      const endTime = startTime + animation.duration;
      if (state.lastTime <= startTime && startTime <= time && !entry.active) {
        entry.active = true;
      }
      if (state.lastTime <= endTime && endTime <= time && entry.active) {
        entry.active = false;
        animation.time = time - startTime;
      }
      if (entry.active) {
        actives.push(entry);
      }
    }
    
    for (const {startTime, animation} of actives) {
      animation.time = time - startTime;
    }

    state.lastTime = time;
  }
}