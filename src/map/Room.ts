import { Rectangle, Point } from "pixi-boilerplate/geom";
import { Map } from "./Map";

export class Room {
  public bounds: Rectangle;
  public spawnPoints: Point[];
  protected enemies: any[];
  protected map: Map;

  constructor({bounds, map}: {bounds: Rectangle, map: Map}) {
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