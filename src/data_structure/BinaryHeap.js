export class BinaryHeap {
  constructor(compare) {
    this.data = [];
    this.compare = compare ? compare : (a, b) => a - b;
  }

  add(x) {
    if (this.data.length === 0) {
      this.data.push(x);
    } else {
      let i = this.data.length;
      this.data.push(x);
      let j = parentIndex(i);
      while (j >= 0 && this.compare(this.data[j], this.data[i]) < 0) {
        const swp = this.data[j];
        this.data[j] = this.data[i];
        this.data[i] = swp;
        i = j;
        j = parentIndex(i);
      }
    }
    return this;
  }

  removeTop() {
    if (this.data.length === 1) {
      return this.data.pop();
    } else if (this.data.length > 1) {
      let i = 0;
      const top = this.data[i];
      this.data[i] = this.data.pop();
      const indexes = childrenIndexes(i);
      let j = indexes[0];
      if (this.compare(this.data[indexes[1]], this.data[j]) > 0) {
        j = indexes[1];
      }
      while (this.compare(this.data[i], this.data[j]) < 0) {
        const swp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = swp;
        i = j;
        const indexes = childrenIndexes(i);
        j = indexes[0];
        if (this.compare(this.data[indexes[1]], this.data[j]) > 0) {
          j = indexes[1];
        }
      }
      return top;
    }
  }
}

function parentIndex(i) {
  return (i - 1) >> 1;
}

function childrenIndexes(i) {
  return [(i << 1) + 1, (i + 1) << 1];
}