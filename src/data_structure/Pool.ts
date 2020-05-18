export class Pool<T> {
  protected blockSize: number;
  protected pool: T[];
  protected createFunction: () => T;

  constructor(createFunction: (...args: any[]) => T, size: number = 10) {
    this.blockSize = size;
    this.createFunction = createFunction;
    this.pool = new Array(this.blockSize);
    for (let i = 0; i < this.blockSize; i++) {
      this.pool[i] = this.createFunction();
    }
  }

  public get size() {
    return this.pool.length;
  }

  public free(element: T) {
    this.pool.push(element);
  }

  public get() {
    if (this.pool.length === 0) {
      throw new Error("Pool size overflow.");
    } 
    return this.pool.pop();
  }
  
  public resize(size: number) {
    for (let i = this.pool.length; i < size; i++) {
      this.pool.push(this.createFunction());
    }
  }
}