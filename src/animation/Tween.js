import {Animation} from "./Animation";


export class Tween extends Animation {
    static fromTo(target, duration, from, to) {
        const params = {};
        const keys = [
            'onComplete',
            'onStart',
            'ticker',
            'paused'
        ];
        for (const k of keys) {
            if (to[k] !== undefined) {
                params[k] = to[k];
            }
        }
        return new Animation({
            onUpdate: t => {
                Object.assign(
                    target, 
                    olerp(from, to)(t / duration)
                );
                if (to.onUpdate) {
                    to.onUpdate(t);
                }
            }, 
            duration,
            ...params
        });
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
