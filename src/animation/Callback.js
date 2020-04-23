import { Animation } from "./Animation";

export class Callback extends Animation {
  constructor(fn, options) {
    const {
      duration: _,
      onStart,
      ...restOptions
    } = {
      ...options
    };
    super({
      onStart: () => {
        fn();
        if (onStart) {
          onStart();
        }
      },
      duration: 0,
      ...restOptions
    });
  }
}