export class Observable {
  constructor(executor) {
    let subscribers = [];

    this.subscribe = (subscriber, priority = Number.POSITIVE_INFINITY) => {
      const index = Math.min(priority, subscribers.length - 1);
      subscribers.splice(index, 0, subscriber);
      return () => subscribers.splice(index, 1);
    };

    this.unsubscribe = (subscriber) => {
      subscribers = subscribers.filter(f => f !== subscriber);
    };
    
    const notify = value => {
      subscribers.forEach(f => f(value));
    };

    executor(notify);
  }
}