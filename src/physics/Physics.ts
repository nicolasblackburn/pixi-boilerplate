import { abs, add, addmult, createPoint, pointsBounds, createRectangle, rectanglesIntersect, sub, Rectangle, Point, pointCopy } from "pixi-boilerplate/geom";
import { getBodyBounds } from "pixi-boilerplate/physics";
import { Body } from "pixi-boilerplate/physics/Body";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { MapCollision } from "./MapCollision";
import { POINT2D_POOL } from "pixi-boilerplate/geom/Point2D";
import { RECTANGLE2D_POOL } from "pixi-boilerplate/geom/Rectangle2D";
import { TiledMap } from "pixi-boilerplate/map/TiledMap";

const STATIC_FRICTION = 300;
const STEPS_PER_SECOND = 10;
const FPS = 60;
const MAX_SKIP_STEPS = 5;

function hasOnMapCollide(o: any): o is {onMapCollide(collision: MapCollision): void} {
  return o.onMapCollide !== undefined;
}

export class Physics {
  protected services: ApplicationServices;
  protected bodies: Body[];
  protected map: TiledMap;
  protected bounds: Rectangle;
  protected extraMS: number;
  protected stepDuration: number;

  constructor(options: any) {
    const {services, stepDuration}: any = {
      stepDuration: 1000 / FPS / STEPS_PER_SECOND,
      ...options
    };

    const {renderer} = services;

    this.services = services;
    this.bodies = [];
    this.bounds = createRectangle(0, 0, renderer.width, renderer.height);
    this.extraMS = 0;
    this.stepDuration = stepDuration;
  }

  /**
   * @param {Rectangle} bounds 
   */
  public setBounds(bounds: Rectangle) {
    this.bounds = bounds;
  }
  
  public setMap(map: any) {
    this.map = map;
    this.setBounds(this.map.viewportBounds);
  }

  /**
   * @param {Body} body 
   * @param {number} priority 
   */
  public addBody(body: Body, priority?: number) {
    if (!this.bodies.includes(body)) {
      this.bodies.splice(priority !== undefined ? priority : this.bodies.length - 1, 0, body);
    }
  }

  /**
   * @param {Body} body 
   */
  public removeBody(body: Body) {
    this.bodies = this.bodies.filter(bodyB => bodyB !== body);
  }

  /**
   * @param {number} deltaTime 
   */
  public update(deltaTime: number) {
    this.extraMS += deltaTime;
    const fixedDeltaTime = this.stepDuration / 1000;
    let steps = 0;
    while (this.extraMS > 0 && steps < MAX_SKIP_STEPS + STEPS_PER_SECOND) {
      for (const body of this.bodies) {
        const lastPosition = pointCopy(body.position);
        this.updateBody(fixedDeltaTime, body, STATIC_FRICTION);
        this.processMapCollisions(lastPosition, body);
        body.transform.translate.x = -this.map.position.x;
        body.transform.translate.y = -this.map.position.y;
      }
      this.extraMS -= this.stepDuration;
      steps++;
    } 
    if (steps >= MAX_SKIP_STEPS + STEPS_PER_SECOND) {
      this.extraMS = 0;
    }
  }

  protected updateBody(deltaTime: number, body: Body, frictionCoef: number) {
    const acceleration = POINT2D_POOL.get().assign(body.acceleration);
    const friction = POINT2D_POOL.get().assign(body.velocity);
    const position = POINT2D_POOL.get().assign(body.position);
    const velocity = POINT2D_POOL.get().assign(body.velocity);

    velocity
      .add(
        acceleration
          .multiply(deltaTime * body.mass)
    )
    .clampRadius(body.maxSpeed)
    .assignTo(body.velocity);

    friction.normalize().multiply(-deltaTime * body.mass * frictionCoef);
    if (friction.abs() < abs(body.velocity)) {
      velocity.add(friction);
    } else {
      velocity.assign(0, 0);
    }

    velocity.assignTo(body.velocity);

    position.add(velocity.multiply(deltaTime)).assignTo(body.position);

    POINT2D_POOL.free(acceleration);
    POINT2D_POOL.free(friction);
    POINT2D_POOL.free(position);
    POINT2D_POOL.free(velocity);
  }

  protected processMapCollisions(previousPosition: Point, body: Body) {
    if (this.map) {
      const displacement = POINT2D_POOL.get().assign(body.position).subtract(previousPosition);
      const bodyRect = RECTANGLE2D_POOL.get();
      const clipRect = RECTANGLE2D_POOL.get();
      
      getBodyBounds(body, bodyRect);

      const previousBodyRect = RECTANGLE2D_POOL.get().assign(bodyRect).positionSubtract(displacement);

      pointsBounds([
        previousBodyRect, 
        add(createPoint(previousBodyRect.width, previousBodyRect.height), previousBodyRect),
        add(displacement, previousBodyRect),
        add(displacement, createPoint(previousBodyRect.width, previousBodyRect.height), previousBodyRect)
      ], clipRect);

      const maxVisibleTilesCount = this.map.maxVisibleTilesCount.x * this.map.maxVisibleTilesCount.y;
      const tileResources = new Array(maxVisibleTilesCount);
      const tiles = new Array(maxVisibleTilesCount);
      for (let i = 0; i < maxVisibleTilesCount; i++) {
        tileResources[i] = RECTANGLE2D_POOL.get();
        tiles[i] = tileResources[i];
      }

      this.map.getSolidTilesInRectangle(clipRect, tiles);

      body.position.y -= displacement.y;
      getBodyBounds(body, bodyRect);
      
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile)) {
          body.position.x = previousPosition.x;
          if (hasOnMapCollide(body)) {
            body.onMapCollide(new MapCollision(createPoint(0, 1)));
          }
          break;
        }
      }

      body.position.y += displacement.y;
      getBodyBounds(body, bodyRect);
      
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile)) {
          body.position.y = previousPosition.y;
          if (hasOnMapCollide(body)) {
            body.onMapCollide(new MapCollision(createPoint(1, 0)));
          }
          break;
        }
      }

      POINT2D_POOL.free(displacement);
      RECTANGLE2D_POOL.free(bodyRect);

      for (const tile of tileResources) {
        RECTANGLE2D_POOL.free(tile);
      }
    }
  }
}