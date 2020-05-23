import { Rectangle, Point } from "pixi-boilerplate/geom";
import { Room } from "./Room";
import { MapRoomBoundsCollision } from "pixi-boilerplate/physics/MapRoomBoundsCollision";

export interface TiledMap {
  getCurrentRoom(): Room;
  getSolidTilesInRectangle(rectangle: Rectangle, tiles?: Rectangle[]): Rectangle[];
  maxVisibleTilesCount: Point;
  onRoomBoundsCollide(collision: MapRoomBoundsCollision): void;
  position: Point;
  viewportBounds: Rectangle;
  viewportTilesCount: Point;
}