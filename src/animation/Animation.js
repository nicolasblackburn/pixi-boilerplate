export class Animation {
    constructor({paused, ...options}) {
        const {
            duration,
            onComplete,
            onStart,
            onUpdate, 
            ticker
        } = {
            duration: Number.POSITIVE_INFINITY,
            ticker: Animation.sharedTicker, 
            onComplete: () => null,
            onStart: () => null,
            onUpdate: () => null,
            ...options
        };

        const emitter = new PIXI.utils.EventEmitter();
        let started = false;
        let elapsedTime;

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
                    const completeOnce = () => {
                        if (started) {
                            started = false;
                            this.pause();
                            onComplete(time);
                            emitter.emit('complete', time);
                        }
                    };
                    onUpdate(Math.min(time, duration), completeOnce);
                    emitter.emit('update', time);
                    elapsedTime = time;
                    if (time >= duration) {
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

        /**
         * @public
         */
        this.play = () => {
            if (paused) {
                paused = false;
                ticker.add(updateTicker);
                if (!started) {
                    started = true;
                    this.time = 0;
                    onStart();
                    emitter.emit('start');
                }
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
Animation.sharedTicker = PIXI.Ticker.shared;