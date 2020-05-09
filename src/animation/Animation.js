import {Ticker} from "pixi-boilerplate/animation/Ticker";

let ids = 0;

export class SkipEvents {
    constructor(time) {
        this.time = time;
    }
}

export class Animation {
    constructor({paused, ...options}) {
        const {
            id,
            duration,
            onComplete,
            onStart,
            onUpdate, 
            ticker
        } = {
            id: (new Date().getTime() + (ids++)).toString(16),
            duration: Number.POSITIVE_INFINITY,
            ticker: Animation.sharedTicker, 
            onComplete: () => null,
            onStart: () => null,
            onUpdate: () => null,
            ...options
        };

        const emitter = new PIXI.utils.EventEmitter();
        let started = false;
        let elapsedTime = 0;

        const updateTicker = () => {
            if (!paused) {
                this.time += ticker.elapsedMS;
            }
        };

        Object.defineProperties(this, {
            /**
             * @public
             */
            time: {
                enumerable: true,
                configurable: true,
                
                get: () => {
                    return elapsedTime;
                },

                set: (time) => {
                    let skipEvents = false;
                    if (time instanceof SkipEvents) {
                        skipEvents = true;
                        time = time.time;
                    }
                    let once = false;
                    const completeOnce = () => {
                        if (!once) {
                            started = false;
                            once = true;
                            this.pause();
                            if (!skipEvents) {
                                onComplete(time);
                                emitter.emit('complete', time);
                            }
                        }
                    }
                    if (!started) {
                        started = true;
                        onUpdate(0, completeOnce);
                        if (!skipEvents) {
                            onStart();
                            emitter.emit('start');
                        }
                    }
                    onUpdate(time, completeOnce);
                    if (!skipEvents) {
                        emitter.emit('update', time);
                    }
                    elapsedTime = Math.min(time, this.duration);
                    if (time >= this.duration) {
                        completeOnce();
                    }
                }
            },

            /**
             * @public
             * @readonly
             */
            paused: {
                enumerable: true,
                get() {
                    return paused;
                }
            },

            /**
             * @public
             * @readonly
             */
            duration: {
                enumerable: true,
                configurable: true,
                get() {
                    return duration;
                }
            }
        });

        this.toString = () => {
            return `[Animation #${id}]`
        };

        /**
         * @public
         */
        this.play = () => {
            if (paused) {
                paused = false;
                ticker.add(updateTicker);
            }
        };

        /**
         * @public
         */
        this.pause = () => {
            if (!paused) {
                ticker.remove(updateTicker);
                paused = true;
            }
        };

        /**
         * @public
         */
        this.on = (event, fn, priority) => {
            emitter.on(event, fn, priority);
        };
      
        /**
         * @public
         */
        this.off = (event, fn) => {
            emitter.off(event, fn);
        };

        if (!paused) {
            paused = true;
            this.play();
        }
    }
}

/**
 * @public
 * @static
 */
Animation.sharedTicker = Ticker.shared;