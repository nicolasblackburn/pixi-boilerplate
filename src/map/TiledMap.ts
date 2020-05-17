import { Rectangle, Point } from "pixi-boilerplate/geom";

export interface TiledMap {
  getSolidTilesInRectangle(rectangle: Rectangle, tiles?: Rectangle[]): Rectangle[];
  maxVisibleTilesCount: Point;
  position: Point;
  viewportBounds: Rectangle;
  viewportTilesCount: Point;
}