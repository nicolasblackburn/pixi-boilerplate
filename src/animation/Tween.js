import {Animation} from "pixi-boilerplate/animation/Animation";

export class Tween extends Animation {
    constructor(target, duration, from, to) {
        const {onUpdate, duration: _, ...restOptions} = to;
        const valueAt = t => olerp(from, to)(t / duration);
        super({
            onUpdate: t => {
                Object.assign(
                    target, 
                    valueAt(Math.min(t, duration))
                );
                if (onUpdate) {
                    onUpdate(t);
                }
            },
            duration,
            ...restOptions
        });
        this.valueAt = valueAt;
    }

    static fromTo(target, duration, from, to) {
        return new Tween(target, duration, from, to);
    }

    static from(target, duration, from) {
        const to = {};
        for (const k in from) {
            to[k] = target[k];
        }
        return Tween.fromTo(target, duration, from, to);
    }

    static to(target, duration, to) {
        const from = {};
        for (const k in to) {
            from[k] = target[k];
        }
        return Tween.fromTo(target, duration, from, to);
    }
}
