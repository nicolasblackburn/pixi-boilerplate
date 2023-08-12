export class ButtonEvent {
  readonly type: string;
  readonly pressed: boolean;
  readonly value: number;
  readonly index: number;

  constructor(type: string, state: {pressed: boolean, value: number, index: number}) {
    this.type = type;
    this.pressed = state.pressed;
    this.value = state.value;
    this.index = state.index;
  }
}