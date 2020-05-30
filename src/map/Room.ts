import { Rectangle, Point } from "pixi-boilerplate/geom";
import { TiledMap } from "./TiledMap";

export class Room {
  public bounds: Rectangle;
  public spawnPoints: Point[];
  protected enemies: any[];
  protected map: TiledMap;

  constructor({bounds, map}: {bounds: Rectangle, map: TiledMap}) {
    this.bounds = bounds;
    this.enemies = [];
    this.map = map;
    this.spawnPoints = [];
  }

  public addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  public getEnemies() {
    return this.enemies.slice();
  }
}