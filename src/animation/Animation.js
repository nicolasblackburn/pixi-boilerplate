export class Animation {
    constructor({onUpdate, paused, ...options}) {
        const {
            duration,
            onComplete,
            ticker
        } = {
            duration: Number.POSITIVE_INFINITY,
            ticker: Animation.sharedTicker, 
            onComplete: () => null,
            ...options
        };

        let startTime;
        let elapsedTime;

        const updateTicker = () => {
            if (!paused) {
                const newTime = this.time + ticker.elapsedMS;
                this.time = Math.min(duration, newTime);
                if (newTime >= duration) {
                    this.pause();
                    onComplete(newTime);
                }
            }
        };

        Object.defineProperties(this, {
            /**
             * @public
             */
            time: {
                get() {
                    return elapsedTime;
                },

                set(time) {
                    elapsedTime = time;
                    onUpdate(elapsedTime);
                }
            },

            /**
             * @public
             * @readonly
             */
            paused: {
                get() {
                    return paused;
                }
            },

            /**
             * @public
             * @readonly
             */
            duration: {
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
                startTime = performance.now();
                this.time = 0;
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

        if (!paused) {
            this.play();
        }
    }
}

/**
 * @public
 * @static
 */
Animation.sharedTicker = PIXI.Ticker.shared;