export function create(executor) {
  const props = {
    observers: undefined,
    unsubscribe: undefined
  };
  return {
    _props: props,
    clear: () => {
      if (props.unsubscribe) {
        props.unsubscribe();
        props.unsubscribe = undefined;
      }
      if (props.observers) {
        props.observers.forEach(({clear}) => {
          if (clear) {
            clear();
          }
        });
        props.observers = undefined;
      }
    },
    subscribe: observer => {
      if (typeof observer === 'function') {
        observer = {
          next: observer
        };
      }
      if (!props.observers) {
        props.observers = [];
        const observerA = {
          next: v => props.observers.forEach(observer => observer.next ? observer.next(v) : null),
          error: err => props.observers.forEach(observer => observer.error ? observer.error(err) : null),
          complete: v => props.observers.forEach(observer => observer.complete ? observer.complete(v) : null)
        };
        props.unsubscribe = executor(observerA);
      }
      props.observers.push(observer);
      return {
        unsubscribe: () => {
          let i = 0;
          while (props.observers && i < props.observers.length) {
            const observerB = props.observers[i];
            if (observer === observerB) {
              props.observers.splice(i, 1);
            } else {
              i++;
            }
          }
        },
        then: (resolve, reject) => promiseFrom(observable).then(resolve, reject)
      };
    },
    map: f => map(f, observable),
    scan: (f, unit) => scan(f, unit, observable),
    then: (resolve, reject) => promiseFrom(observable).then(resolve, reject)
  };
}

function map(f, subject) {
  return create(observer => {
    return subject.subscribe({
      ...observer,
      next: v => observer.next(f(v))
    }).unsubscribe;
  });
}

function promiseFrom(subject) {
  return new Promise((resolve, reject) => {
    subject.subscribe({
      error: reason => reject({tag: 'error', ...(reason !== undefined ? {reason} : {})}),
      complete: resolve,
      clear: reason => reject({tag: 'clear', ...(reason !== undefined ? {reason} : {})})
    });
  });
}

function scan(f, unit, subject) {
  let reduced = unit;
  const subjectB = create(observer => {
    return subject.subscribe({
      ...observer,
      next: (v) => {
        reduced = f(v, reduced);
        observer.next(reduced);
      }
    }).unsubscribe;
  });
  const {clear} = subjectB;
  subjectB.clear = () => {
    clear();
    reduced = unit;
  }
  return subjectB;
}