import { abs, add, createPoint, pointsBounds, rectanglesIntersect, Point, pointCopy, Rectangle, createRectangle, floatEqual } from "pixi-boilerplate/geom";
import { getBodyBounds } from "pixi-boilerplate/physics";
import { Body } from "pixi-boilerplate/physics/Body";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { MapCollision } from "./MapCollision";
import { POINT2D_POOL } from "pixi-boilerplate/geom/Point2D";
import { RECTANGLE2D_POOL } from "pixi-boilerplate/geom/Rectangle2D";
import { Map } from "pixi-boilerplate/map/Map";
import { EventEmitter } from "pixi-boilerplate/events/EventEmitter";
import { System } from "pixi-boilerplate/system/System";

const STATIC_FRICTION = 300;

interface PhysicsEntity {
  body: Body;
}

function hasOnMapCollide(o: any): o is {onMapCollide(collision: MapCollision): void} {
  return o.onMapCollide !== undefined;
}

export class Physics extends System<PhysicsEntity> {
  public events: EventEmitter;

  protected map: Map;
  protected services: ApplicationServices;

  constructor(options: {services: ApplicationServices}) {
    super(options);
    this.events = new EventEmitter();
  }
  
  public setMap(map: Map) {
    this.map = map;
  }

  public fixedUpdate(deltaTime: number) {
    for (const {body} of this.entities) {
      const lastPosition = pointCopy(body.position);
      this.updateBody(deltaTime, body, STATIC_FRICTION);
      this.processMapCollisions(lastPosition, body);
    }
    this.events.emit("fixedupdate", deltaTime);
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
    .clampRadius(body.maxVelocityMagnitude)
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
      const previousBodyRect = RECTANGLE2D_POOL.get();
      
      getBodyBounds(body, bodyRect);
      previousBodyRect.assign(bodyRect).positionSubtract(displacement);

      pointsBounds([
        previousBodyRect, 
        add(createPoint(previousBodyRect.width, previousBodyRect.height), previousBodyRect),
        add(displacement, previousBodyRect),
        add(displacement, createPoint(previousBodyRect.width, previousBodyRect.height), previousBodyRect)
      ], clipRect);

      const tiles = this.map.getCollidablesInRectangle(clipRect);
      const tileResources = new Array(tiles.length);
      for (let i = 0; i < tiles.length; i++) {
        tileResources[i] = RECTANGLE2D_POOL.get();
      }

      body.position.y -= displacement.y;
      getBodyBounds(body, bodyRect);
      
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile.body.bounds)) {
          if (this.collideCornerTop(bodyRect, tile.body.bounds)) {
            body.position.x = previousPosition.x;
            if (Math.abs(displacement.x) / Math.SQRT2 > Math.abs(displacement.y)) {
              body.position.y -= Math.abs(displacement.x) / Math.SQRT2;
              displacement.y = 0
            }
          } else if (this.collideCornerBottom(bodyRect, tile.body.bounds)) {
            body.position.x = previousPosition.x;
            if (Math.abs(displacement.x) / Math.SQRT2 > Math.abs(displacement.y)) {
              body.position.y += Math.abs(displacement.x) / Math.SQRT2;
              displacement.y = 0
            }
          } else {
            body.position.x = previousPosition.x;
            if (hasOnMapCollide(body.entity)) {
              body.entity.onMapCollide(new MapCollision(createPoint(displacement.x < 0 ? 1 : -1, 0)));
            }
          }
          break;
        }
      }

      body.position.y += displacement.y;
      getBodyBounds(body, bodyRect);
      
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile.body.bounds)) {
          if (this.collideCornerLeft(bodyRect, tile.body.bounds)) {
            body.position.y = previousPosition.y;
            if (Math.abs(displacement.y) / Math.SQRT2 > Math.abs(displacement.x)) {
              body.position.x -= Math.abs(displacement.y) / Math.SQRT2;
              displacement.x = 0
            }
          } else if (this.collideCornerRight(bodyRect, tile.body.bounds)) {
            body.position.y = previousPosition.y;
            if (Math.abs(displacement.y) / Math.SQRT2 > Math.abs(displacement.x)) {
              body.position.x += Math.abs(displacement.y) / Math.SQRT2;
              displacement.x = 0
            }
          } else {
            body.position.y = previousPosition.y;
            if (hasOnMapCollide(body)) {
              body.onMapCollide(new MapCollision(createPoint(0, displacement.y < 0 ? 1 : -1)));
            }
          }
          break;
        }
      }

      POINT2D_POOL.free(displacement);
      RECTANGLE2D_POOL.free(bodyRect);
      RECTANGLE2D_POOL.free(clipRect);
      RECTANGLE2D_POOL.free(previousBodyRect);

      for (const tile of tileResources) {
        RECTANGLE2D_POOL.free(tile);
      }
    }
  }

  protected collideCornerBottom(bodyRect: Rectangle, tile: Rectangle) {
    const offset = tile.height / 2 | 0;
    return this.map.canMove(tile.x, tile.y + tile.height) && tile.y + offset - bodyRect.y < offset;
  }

  protected collideCornerLeft(bodyRect: Rectangle, tile: Rectangle) {
    const offset = tile.width / 2 | 0;
    return this.map.canMove(tile.x - tile.width, tile.y) && bodyRect.x + bodyRect.width - tile.x - offset < offset;
  }

  protected collideCornerRight(bodyRect: Rectangle, tile: Rectangle) {
    const offset = tile.width / 2 | 0;
    return this.map.canMove(tile.x + tile.width, tile.y) && tile.x + offset - bodyRect.x < offset;
  }

  protected collideCornerTop(bodyRect: Rectangle, tile: Rectangle) {
    const offset = tile.height / 2 | 0;
    return this.map.canMove(tile.x, tile.y - tile.height) && bodyRect.y + bodyRect.height - tile.y - offset < offset;
  }
}