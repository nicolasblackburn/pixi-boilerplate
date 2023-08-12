export class AxisEvent {
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly indexes: number[];

  constructor(type: string, state: {x: number, y: number, indexes: number[]}) {
    this.type = type;
    this.x = state.x;
    this.y = state.y;
    this.indexes = [...state.indexes];
  }
}