import { Rectangle, Point } from "pixi-boilerplate/geom";

export interface TiledMap {
  tilesCount: Point;
  tileSize: Point;
  getSolidTilesInRectangle(rectangle: Rectangle, tiles?: Rectangle[]): Rectangle[];
  getTileIdAt(x: number, y: number);
  isSolid(tileId: number);
  maxVisibleTilesCount: Point;
  position: Point;
}