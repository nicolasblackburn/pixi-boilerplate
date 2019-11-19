export class Inputs {
  constructor() {
    this.downKeys = {};
    this.pointerDown = false;
    document.addEventListener("keydown", event => {
      this.downKeys[event.key] = true;
    });
    document.addEventListener("keyup", event => {
      this.downKeys[event.key] = false;
    });
    document.addEventListener("pointerdown", event => {
      this.pointerDown = true;
    });
    document.addEventListener("pointerup", event => {
      this.pointerDown = false;
    });
  }

  isKeyDown(key) {
    return this.downKeys[key] === undefined ? false : this.downKeys[key];
  } 

  isKeyUp(key) {
    return !this.isKeyDown(key);
  } 

  isPointerDown() {
    return this.pointerDown;
  } 

  isPointerUp() {
    return !this.pointerDown;
  } 
}