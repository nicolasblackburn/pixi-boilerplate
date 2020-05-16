import {Ticker} from "./Ticker";
import { EventEmitter } from "../events/EventEmitter";

let ids = 0;

export class Animation {
    public static sharedTicker: Ticker = Ticker.shared;
    
    protected _duration: number;
    protected _paused: boolean;
    protected elapsedTime: number;
    protected emitter: EventEmitter;
    protected id: string;
    protected started: boolean;
    protected ticker: Ticker;

    constructor(options: Partial<{duration: number, id: string, onComplete(...args: any[]): any, onStart(...args: any[]): any, onUpdate(...args: any[]): any, paused: boolean}>) {
        const {
            duration,
            id,
            onComplete,
            onStart,
            onUpdate, 
            paused,
            ticker
        } = {
            duration: Number.POSITIVE_INFINITY,
            id: (new Date().getTime() + (ids++)).toString(16),
            onComplete: () => null,
            onStart: () => null,
            onUpdate: () => null,
            paused: false,
            ticker: Animation.sharedTicker, 
            ...options
        };

        this._duration = duration;
        this._paused = paused;
        this.elapsedTime = 0;
        this.emitter = new EventEmitter();
        this.id = id;
        this.started = false;
        this.ticker = ticker;

        this.emitter.on('start', onStart);
        this.emitter.on('update', onUpdate);
        this.emitter.on('complete', onComplete);

        if (!this._paused) {
            this._paused = true;
            this.play();
        }
    }
    
    public get duration() {
        return this._duration;
    }

    public get paused() {
        return this._paused;
    }
                
    public get time() {
        return this.elapsedTime;
    }

    public set time(time: number) {
        let skipEvents = false;
        if (time === null) {
            skipEvents = true;
        }
        let once = false;
        const completeOnce = () => {
            if (!once) {
                this.started = false;
                once = true;
                this.pause();
                if (!skipEvents) {
                    this.emitter.emit('complete', time);
                }
            }
        }
        if (!this.started) {
            this.started = true;
            this.emitter.emit('update', 0, completeOnce);
            if (!skipEvents) {
                this.emitter.emit('start');
            }
        }
        this.emitter.emit('update', time, completeOnce);
        if (!skipEvents) {
            this.emitter.emit('update', time);
        }
        this.elapsedTime = Math.min(time, this.duration);
        if (time >= this.duration) {
            completeOnce();
        }
    }

    public pause() {
        if (!this._paused) {
            this.ticker.remove(this.updateTicker, this);
            this._paused = true;
        }
    };
    
    public play() {
        if (this._paused) {
            this._paused = false;
            this.ticker.add(this.updateTicker, this);
        }
    }

    public on(event, fn, priority) {
        this.emitter.on(event, fn, priority);
    }
  
    public off(event, fn) {
        this.emitter.off(event, fn);
    }

    public toString() {
        return `[Animation #${this.id}]`;
    }

    protected updateTicker() {
        if (!this._paused) {
            this.time += this.ticker.elapsedMS;
        }
    }
}