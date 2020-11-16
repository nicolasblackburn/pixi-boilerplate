import { abs, pointCopy } from "pixi-boilerplate/geom";
import { Body } from "pixi-boilerplate/physics/Body";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";
import { POINT2D_POOL } from "pixi-boilerplate/geom/Point2D";
import { EventEmitter } from "pixi-boilerplate/events/EventEmitter";
import { System } from "pixi-boilerplate/system/System";

const STATIC_FRICTION = 300;

interface PhysicsEntity {
  body: Body;
}

export class Physics extends System<PhysicsEntity> {
  public events: EventEmitter;

  protected services: ApplicationServices;

  constructor(options: {services: ApplicationServices}) {
    super(options);
    this.events = new EventEmitter();
  }

  public fixedUpdate(deltaTime: number) {
    for (const entity of this.entities) {
      const lastPosition = pointCopy(entity.body.position);
      this.updateBody(deltaTime, entity.body, STATIC_FRICTION);
      this.events.emit('entityUpdate', {entity, lastPosition, deltaTime});
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
}