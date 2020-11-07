import { Rectangle, Point } from "pixi-boilerplate/geom";
import { Room } from "./Room";

export interface TiledMap {
  currentRoom: Room;
  maxVisibleTilesCount: Point;
  position: Point;
  rooms: Room[];
  tilesCount: Point;
  tileSize: Point;
  
  spawn(): void;
  getSolidTilesInRectangle(rectangle: Rectangle, tiles?: Rectangle[]): Rectangle[];
  getTileIdAt(x: number, y: number): number;
  isSolid(tileId: number): boolean;
  getRoomAt(x: number, y: number): Room;
}