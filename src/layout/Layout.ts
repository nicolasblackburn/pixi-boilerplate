import { timeout } from "pixi-boilerplate/utils";
import { EventEmitter } from "pixi-boilerplate/events/EventEmitter";
import { createRectangle, rectangleEqual, Rectangle } from "pixi-boilerplate/geom";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { resizeInto } from ".";

export class Layout {
  public events: EventEmitter;
  public gameBounds: Rectangle;
  public viewport: Rectangle;
  protected services: ApplicationServices;
  protected scheduledResize: (...args: any[]) => any;

  constructor({gameBounds, services}: {gameBounds: Rectangle, services: ApplicationServices}) {
    this.events = new EventEmitter();
    this.gameBounds = gameBounds;
    this.viewport = createRectangle(0, 0, window.innerWidth, window.innerHeight);
    this.services = services;
    this.scheduledResize = null;

    window.addEventListener("resize", () => this.resize({
      x: 0, 
      y: 0, 
      width: window.innerWidth, 
      height: window.innerHeight
    }));
  }

  public triggerResize() {
    this.services.renderer.renderer.resize(this.viewport.width, this.viewport.height);
    resizeInto(this.viewport, this.gameBounds, this.services.stage);
    this.events.emit("resize", this.viewport);
  } 

  protected resize(viewport: Rectangle) {
    if (!rectangleEqual(this.viewport, viewport)) {
      this.viewport = viewport;
      if (!this.scheduledResize) {
        this.scheduledResize = timeout(this.services.ticker, 200, () => {
          this.scheduledResize = null;
          this.triggerResize();
        });
      }
    }
  }
}