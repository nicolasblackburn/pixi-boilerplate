export class Pool<T> {
  protected pool: T[];
  protected createFunction: () => T;

  constructor(createFunction: (...args: any[]) => T, size: number = 10) {
    this.createFunction = createFunction;
    this.pool = new Array(size);
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i] = this.createFunction();
    }
  }

  public create(...params: any[]) {
    return this.create(...params);
  }

  public free(element: T) {
    this.pool.push(element);
  }

  public get() {
    return this.pool.pop();
  }
  
  public resize(size: number) {
    for (let i = this.pool.length; i < size; i++) {
      this.pool.push(this.createFunction());
    }
  }
}