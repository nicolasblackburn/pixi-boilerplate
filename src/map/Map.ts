import { Rectangle, Point } from "pixi-boilerplate/geom";
import { Body } from "pixi-boilerplate/physics/Body";

export interface Map {
  position: Point;
  
  getCollidablesInRectangle(rectangle: Rectangle): {body: Body}[];
  canMove(x: number, y: number): boolean
}